import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { APIEndPoint } from '../config';
import './GatewayAdmin.css';

interface FieldDef {
  key: string;
  label: string;
  group: string;
  type?: 'text' | 'password';
}

const FIELDS: FieldDef[] = [
  { key: 'OPCUA_ENDPOINT', label: '엔드포인트', group: 'OPC-UA' },
  { key: 'OPCUA_USERNAME', label: '사용자명', group: 'OPC-UA' },
  { key: 'OPCUA_PASSWORD', label: '비밀번호', group: 'OPC-UA', type: 'password' },
  { key: 'OPCUA_NODES', label: '구독 노드 (콤마 구분)', group: 'OPC-UA' },
  { key: 'OPCUA_SAMPLING_INTERVAL', label: '샘플링 주기 (ms)', group: 'OPC-UA' },
  { key: 'OPCUA_RETRY_INTERVAL', label: '재연결 대기 (초)', group: 'OPC-UA' },
  { key: 'OPCUA_MAX_RETRIES', label: '최대 재시도 (0=무한)', group: 'OPC-UA' },
  { key: 'OPCUA_HEALTH_CHECK_INTERVAL', label: 'Health Check 주기 (초)', group: 'OPC-UA' },

  { key: 'PQ_PATH', label: '큐 파일 경로', group: 'Persistent Queue' },
  { key: 'PQ_SIZE_LIMIT_ENABLED', label: '용량 제한 사용 (true/false)', group: 'Persistent Queue' },
  { key: 'PQ_MAX_MB', label: '최대 용량 (MB)', group: 'Persistent Queue' },

  { key: 'DB_TYPE', label: 'DB 종류 (postgresql/mssql/oracle)', group: 'Database' },
  { key: 'DB_HOST', label: 'Host', group: 'Database' },
  { key: 'DB_PORT', label: 'Port', group: 'Database' },
  { key: 'DB_NAME', label: 'DB 이름', group: 'Database' },
  { key: 'DB_TABLE_NAME', label: '테이블 이름', group: 'Database' },
  { key: 'DB_USER', label: '사용자', group: 'Database' },
  { key: 'DB_PASSWORD', label: '비밀번호', group: 'Database', type: 'password' },
  { key: 'MSSQL_DRIVER', label: 'MSSQL 드라이버', group: 'Database' },

  { key: 'BATCH_SIZE', label: '배치 크기', group: 'Loader' },
  { key: 'POLL_INTERVAL', label: '폴링 주기 (초)', group: 'Loader' },
  { key: 'LOADER_RETRY_INTERVAL', label: '재연결 대기 (초)', group: 'Loader' },
  { key: 'LOADER_MAX_RETRIES', label: '최대 재시도 (0=무한)', group: 'Loader' },

  { key: 'LOG_LEVEL', label: '로그 레벨', group: 'Log' },
  { key: 'LOG_DIR', label: '로그 디렉토리', group: 'Log' },
  { key: 'LOG_MAX_MB', label: '파일당 최대 용량 (MB)', group: 'Log' },
  { key: 'LOG_MAX_FILES', label: '최대 보관 파일 수', group: 'Log' },

  { key: 'MAPPING_PATH', label: '매핑 파일 경로', group: 'Mapper' },
];

interface StatusData {
  log_file: string | null;
  log_tail: string[];
  seconds_since_log: number | null;
  likely_running: boolean;
  pq_pending_lines: number;
  pq_size_bytes: number;
}

interface GatewayInfo {
  id: string;
  name: string;
  root_path: string;
}

const GatewayAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [gateway, setGateway] = useState<GatewayInfo | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showLog, setShowLog] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    const [listRes, configRes, statusRes] = await Promise.all([
      axios.get(`${APIEndPoint}/gateway/api/list`),
      axios.get(`${APIEndPoint}/gateway/api/${id}/config`),
      axios.get(`${APIEndPoint}/gateway/api/${id}/status`),
    ]);
    const found = listRes.data.find((g: GatewayInfo) => g.id === id) || null;
    setGateway(found);
    setValues(configRes.data);
    setStatus(statusRes.data);
  }, [id]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await fetchAll();
      } catch (error) {
        console.error('Failed to load gateway:', error);
      }
      setIsLoading(false);
    };
    init();
    const interval = setInterval(async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${APIEndPoint}/gateway/api/${id}/status`);
        setStatus(res.data);
      } catch (error) {
        console.error('Failed to refresh status:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, fetchAll]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirtyKeys((prev) => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (!id || dirtyKeys.size === 0) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const changed: Record<string, string> = {};
      dirtyKeys.forEach((k) => { changed[k] = values[k]; });
      const res = await axios.post(`${APIEndPoint}/gateway/api/${id}/config`, {
        values: changed,
      });
      setValues(res.data);
      setDirtyKeys(new Set());
      setSaveMessage('저장되었습니다. 반영하려면 프로세스를 재시작하세요.');
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveMessage('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const formatSeconds = (sec: number | null) => {
    if (sec === null) return '알 수 없음';
    if (sec < 60) return `${Math.floor(sec)}초 전`;
    if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
    return `${Math.floor(sec / 3600)}시간 전`;
  };

  const filteredFields = useMemo(() => {
    if (!search.trim()) return FIELDS;
    const q = search.trim().toLowerCase();
    return FIELDS.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        f.group.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="gwadmin-layout">
      <div className="gwadmin-breadcrumb" onClick={() => navigate('/gateway-admin')}>
        ← 게이트웨이 목록
      </div>
      <div className="gwadmin-title">
        {gateway ? gateway.name : '게이트웨이'} 설정
        {gateway && <span className="gwadmin-path">{gateway.root_path}</span>}
      </div>

      <div className="gwadmin-status-card">
        <span className={`gwadmin-status-badge ${status?.likely_running ? 'running' : 'stopped'}`}>
          {status?.likely_running ? '동작 중으로 추정' : '상태 불확실 / 중단됨'}
        </span>
        <span className="gwadmin-status-item">
          최근 로그: {formatSeconds(status?.seconds_since_log ?? null)}
        </span>
        <span className="gwadmin-status-item">
          대기 큐: {status ? status.pq_pending_lines.toLocaleString() : '-'}건
        </span>
        <span className="gwadmin-log-toggle" onClick={() => setShowLog(!showLog)}>
          {showLog ? '로그 접기 ▲' : '로그 보기 ▼'}
        </span>
      </div>

      {showLog && (
        <div className="gwadmin-log-tail">
          {status?.log_tail && status.log_tail.length > 0
            ? status.log_tail.map((line, idx) => <div key={idx}>{line}</div>)
            : <div>로그가 없습니다.</div>}
        </div>
      )}

      {isLoading ? (
        <div className="gwadmin-loading">불러오는 중...</div>
      ) : (
        <>
          <div className="gwadmin-toolbar">
            <input
              className="gwadmin-search"
              placeholder="설정 항목 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="gwadmin-toolbar-right">
              {saveMessage && <span className="gwadmin-save-message">{saveMessage}</span>}
              {dirtyKeys.size > 0 && (
                <span className="gwadmin-dirty-count">{dirtyKeys.size}개 항목 변경됨</span>
              )}
              <button
                className="gwadmin-save-btn"
                onClick={handleSave}
                disabled={isSaving || dirtyKeys.size === 0}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

          <div className="gwadmin-table">
            <div className="gwadmin-row gwadmin-header">
              <div className="gwadmin-col gwadmin-col-group">그룹</div>
              <div className="gwadmin-col gwadmin-col-label">설정 항목</div>
              <div className="gwadmin-col gwadmin-col-key">Key</div>
              <div className="gwadmin-col gwadmin-col-value">값</div>
            </div>

            {filteredFields.map((field) => (
              <div
                className={`gwadmin-row gwadmin-body-row ${dirtyKeys.has(field.key) ? 'dirty' : ''}`}
                key={field.key}
              >
                <div className="gwadmin-col gwadmin-col-group">{field.group}</div>
                <div className="gwadmin-col gwadmin-col-label">{field.label}</div>
                <div className="gwadmin-col gwadmin-col-key">{field.key}</div>
                <div className="gwadmin-col gwadmin-col-value">
                  <input
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </div>
              </div>
            ))}

            {filteredFields.length === 0 && (
              <div className="gwadmin-empty">검색 결과가 없습니다.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GatewayAdmin;