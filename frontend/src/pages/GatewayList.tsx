import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { APIEndPoint } from '../config';
import './GatewayList.css';

interface GatewayItem {
  id: string;
  name: string;
  root_path: string;
  created_at: string;
  likely_running: boolean;
}

const GatewayList: React.FC = () => {
  const navigate = useNavigate();
  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPath, setNewPath] = useState('');

  const fetchList = useCallback(async () => {
    try {
      const res = await axios.get(`${APIEndPoint}/gateway/api/list`);
      setGateways(res.data);
    } catch (error) {
      console.error('Failed to fetch gateway list:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchList();
      setIsLoading(false);
    };
    init();
    const interval = setInterval(fetchList, 10000);
    return () => clearInterval(interval);
  }, [fetchList]);

  const handleAdd = async () => {
    if (!newName.trim() || !newPath.trim()) return;
    try {
      await axios.post(`${APIEndPoint}/gateway/api/list`, {
        name: newName.trim(),
        root_path: newPath.trim(),
      });
      setNewName('');
      setNewPath('');
      setShowAddForm(false);
      fetchList();
    } catch (error) {
      console.error('Failed to add gateway:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmed = window.confirm('이 게이트웨이 등록을 목록에서 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      await axios.delete(`${APIEndPoint}/gateway/api/list/${id}`);
      fetchList();
    } catch (error) {
      console.error('Failed to delete gateway:', error);
    }
  };

  return (
    <div className="gwlist-layout">
      <div className="gwlist-title">게이트웨이 관리</div>

      <div className="gwlist-toolbar">
        <div className="gwlist-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          + 게이트웨이 추가
        </div>
      </div>

      {showAddForm && (
        <div className="gwlist-add-form">
          <input
            placeholder="이름 (예: ITis_Gateway1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="설치 경로 (예: /opt/ITis_Gateway1)"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
          <div className="gwlist-add-confirm" onClick={handleAdd}>등록</div>
        </div>
      )}

      <div className="gwlist-table">
        <div className="gwlist-row gwlist-header">
          <div className="gwlist-col gwlist-col-status">상태</div>
          <div className="gwlist-col gwlist-col-name">이름</div>
          <div className="gwlist-col gwlist-col-path">설치 경로</div>
          <div className="gwlist-col gwlist-col-created">등록일</div>
          <div className="gwlist-col gwlist-col-action"></div>
        </div>

        {isLoading ? (
          <div className="gwlist-empty">불러오는 중...</div>
        ) : gateways.length === 0 ? (
          <div className="gwlist-empty">등록된 게이트웨이가 없습니다. 먼저 추가해주세요.</div>
        ) : (
          gateways.map((g) => (
            <div
              className="gwlist-row gwlist-body-row"
              key={g.id}
              onClick={() => navigate(`/gateway-admin/${g.id}`)}
            >
              <div className="gwlist-col gwlist-col-status">
                <span className={`gwlist-badge ${g.likely_running ? 'running' : 'stopped'}`}>
                  {g.likely_running ? '동작 중' : '중단'}
                </span>
              </div>
              <div className="gwlist-col gwlist-col-name">{g.name}</div>
              <div className="gwlist-col gwlist-col-path">{g.root_path}</div>
              <div className="gwlist-col gwlist-col-created">
                {new Date(g.created_at).toLocaleString('ko-KR')}
              </div>
              <div className="gwlist-col gwlist-col-action">
                <span className="gwlist-delete-btn" onClick={(e) => handleDelete(e, g.id)}>
                  삭제
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GatewayList;