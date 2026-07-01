import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveRadialBar } from '@nivo/radial-bar'
import ResponsiveAnimatedNumber from './Numberanimation';

const theme = {
  axis: {
      ticks: {
          line: {
              stroke: '#fff',
          },
          text: {
              fill: '#fff',
              fontSize: '0.6vw',
          }
      }
  },
  grid: {
      line: {
          stroke: '#888',
          strokeWidth: 1,
      }
  },
}


const themePiechart = {
  labels: {
    text: {
      fontSize: 24, // 원하는 크기로 조절
      fontWeight: 'bold', // 굵게 만들기
      fill: '#333' // 원하는 색상
    }
  },
  legends: {
    text: {
      fontWeight: 'bold', // 굵게 만들기
      fontSize: 16,
    }
  }
};


const themeTop5Chart = {
  labels: {
    text: {
      fill: '#333',
      fontSize: 20,
    },
  },
  legends:{
    text: {
      fontWeight: 'bold',
      fontSize: 16,
      fill: '#333'
    }
  },
  axis:{
    ticks:{
      text: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#FFF'
      }
    },
  },
  grid: {
    line: {
        stroke: '#888',
        strokeWidth: 1,
    }
},
};

interface Props {
  data?: { country: string; 불량: number }[]; 
  max: number;
  total: number;
}

interface TooltipProps {
  id: string | number; // id는 string 또는 number일 수 있음
  value: number; // 막대의 값
  indexValue: string | number; // 인덱스 값
  percentage: number;
}

const CustomTooltip: React.FC<TooltipProps> = ({ id, value, indexValue, percentage }) => (
  <div
    style={{
      background: 'white',
      color: '#333',
      padding: '0.2vw',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    }}
  >
    <strong>{value}개 </strong>
    {percentage.toFixed(2)}%
  </div>
);
const BarChart: React.FC<Props> = ({ 
  data = [
    { "country": "1차 목부 그리스 누유", "불량": 76 },
    { "country": "1차 부트 조립 상태", "불량": 55 },
    { "country": "1차 목부 그리스 누유2", "불량": 44 },
    { "country": "1차 목부 그리스 누유3", "불량": 96 },
    { "country": "1차 목부 그리스 누유4", "불량": 62 },
    { "country": "1차 목부 그리스 누유5", "불량": 191 },
    { "country": "1차 목부 그리스 누유6", "불량": 79 }
  ], 
  max,
  total
}) => {
  return (
     <ResponsiveBar
        data={data}
        keys={[
            '불량'
        ]}
        indexBy="country"
        theme={theme}
        margin={{ top: 12, right: 12, bottom: 36, left: 24 }}
        padding={0.88}
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={"#FF5B45"}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ] 
            ]
        }}
        maxValue={max}
        borderRadius={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 0,
            tickPadding: 8,
            tickRotation: 0,
            legendPosition: 'middle',
            legendOffset: 32,
            format: (value) => value.replace(/_/g, ' '),
            truncateTickAt: 0,
        }}
        axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            tickRotation: 0,
            legendPosition: 'middle',
            truncateTickAt: 0
        }}
        enableLabel={false}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="white"
        legends={[]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        isInteractive={true}
        motionConfig={{
          mass: 1,
          tension: 170,
          friction: 24,
          clamp: true,
          precision: 1.0,
          velocity: 0.1
      }}
      tooltip={(tooltipData) => {
        const percentage = (tooltipData.value / total) * 100; // 비율 계산
        return (
          <CustomTooltip
            id={tooltipData.id}
            value={tooltipData.value}
            indexValue={tooltipData.indexValue}
            percentage={percentage}
          />
        );
      }}

    />
);}

const DonutChart = ({
  data = [
    {
      id: "pikezone1",
      data: [
        {
          x: "OK",
          y: 10, 
        },
        {
          x: "NG",
          y: 64, 
        },
      ],
    },
  ],
}) => {
  const okValue = data[0].data.find(item => item.x === "OK")?.y || 0;
  const ngValue = data[0].data.find(item => item.x === "NG")?.y || 0; 

  const total = okValue + ngValue;
  const ratio = total > 0 ? ((okValue / total) * 100).toFixed(2) : '0';
  const [ratioInt, ratioFloat] = ratio.split('.');
  const digits = [...String(ratioInt).split(''), ...String(ratioFloat).split('')];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveRadialBar
        data={data}
        valueFormat=">-.2f"
        endAngle={360}
        innerRadius={0.8}
        padding={0}
        cornerRadius={25}
        circularAxisOuter={null}
        margin={{ top: 16, right: 16, bottom: 16, left: 24 }}
        colors={["#40DBC1", "#FF5B45"]}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1]],
        }}
        tracksColor="#ff5b45"
        radialAxisStart={null}
        legends={[]} 
        isInteractive={false}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '52%',
        transform: 'translate(-50%, -57%)',
        textAlign: 'center',
        fontSize: '2.0vw',
        fontWeight: 'bold',
        color: '#EEF3FE',
        display: 'flex',        // Use flexbox
        flexDirection: 'row',    // Set flex direction to row for horizontal layout
        alignItems: 'center',    // Center vertically
      }}>
        {digits.length >4 ?(
          <>
          <ResponsiveAnimatedNumber value={+digits[0]} fhdsize={40} duration={500}/>
          <ResponsiveAnimatedNumber value={+digits[1]} fhdsize={40} duration={700}/>
          <ResponsiveAnimatedNumber value={+digits[2]} fhdsize={40} duration={700}/>
          {/* <span style={{fontSize: '1.0vw', fontWeight: 'bold', paddingRight:'0.3vw', paddingTop:'0.7vw', paddingLeft:'0.1vw'}}>.</span> */}
          <div>
            {/* <ResponsiveAnimatedNumber value={+digits[3]} fhdsize={24} duration={900}/>
            <ResponsiveAnimatedNumber value={+digits[4]} fhdsize={24} duration={1100}/> */}
            <span style={{fontSize:'1.0vw'}}>%</span>
          </div>
          </>
        ) : (
          <>
          <ResponsiveAnimatedNumber value={+digits[0]} fhdsize={40} duration={500}/>
          <ResponsiveAnimatedNumber value={+digits[1]} fhdsize={40} duration={700}/>
          <span style={{fontSize: '1.0vw', fontWeight: 'bold', paddingRight:'0.3vw', paddingTop:'0.7vw', paddingLeft:'0.1vw'}}>.</span>
          <div>
            <ResponsiveAnimatedNumber value={+digits[2]} fhdsize={24} duration={900}/>
            <ResponsiveAnimatedNumber value={+digits[3]} fhdsize={24} duration={1100}/>
            <span style={{fontSize:'1.0vw'}}>%</span>
          </div>
          </>
        )}
      </div>
    </div>
  );
};


const Top5_Bar = ({ data = [
  {
    "country": "상단부트목부 \n그리스 누유",
    "1호기": 111,
    "2호기": 124,
    "3호기": 150,
    "4호기": 59,
  },
  {
    "country": "하단부트 말림",
    "1호기": 181,
    "2호기": 144,
    "3호기": 1,
    "4호기": 59,
  },
  {
    "country": "상단 C/Ring 꼬임",
    "1호기": 131,
    "2호기": 124,
    "3호기": 110,
    "4호기": 119,
  },
  {
    "country": "하단부트 찢어짐",
    "1호기": 120,
    "2호기": 114,
    "3호기": 156,
    "4호기": 196,
  },
  {
    "country": "상단 P/ball 로트 타각 식별",
    "1호기": 221,
    "2호기": 195,
    "3호기": 194,
    "4호기": 193,
  }
  ]
  
}) => (
  <ResponsiveBar
      data={data}
      keys={[
          '4호기',
          '3호기',
          '2호기',
          '1호기'
      ]}
      theme={themeTop5Chart}
      indexBy="country"
      margin={{ top: 100, right: 180, bottom: 160, left: 130 }}
      padding={0.8}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={['#33D486', '#5986F9','#FFD97A','#FF5B22' ]}
      borderColor={{
          from: 'color',
          modifiers: [
              [
                  'darker',
                  1.6              ]
          ],
          
      }}
      enableLabel={false}
      enableTotals={true}
      totalsOffset={16}
      borderRadius={0}
      axisTop={null}
      axisRight={null}
      axisBottom={{
          tickSize: 0,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          truncateTickAt: 0,
          
      }}
      axisLeft={{
          tickSize: 0,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          truncateTickAt: 0
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor='white'
      legends={[
          {
              dataFrom: 'keys',
              anchor: 'top-right',
              direction: 'column',
              justify: false,
              translateX: 150,
              translateY: -10,
              itemsSpacing: 16,
              itemWidth: 116,
              itemHeight: 24,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 18,
              symbolShape: 'circle',
              itemTextColor: '#FFF',
              effects: [
                  {
                      on: 'hover',
                      style: {
                          itemOpacity: 1
                      }
                  }
              ]
          }
      ]}
      role="application"
      ariaLabel="Nivo bar chart demo"
      barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
  />
)

const DonutChartDetail = ({
  data = [
    {
      id: "pikezone1",
      data: [
        {
          x: "OK",
          y: 0, 
        },
        {
          x: "NG",
          y: 0, 
        },
      ],
    },
  ],
}) => {
  const okValue = data[0].data.find(item => item.x === "OK")?.y || 0;
  const ngValue = data[0].data.find(item => item.x === "NG")?.y || 0; 

  const total = okValue + ngValue;
  const ratio = total > 0 ? ((okValue / total) * 100).toFixed(2) : 0; 

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveRadialBar
        isInteractive={false}
        data={data}
        valueFormat=">-.2f"
        endAngle={360}
        innerRadius={0.8}
        padding={0}
        cornerRadius={25}
        circularAxisOuter={null}
        margin={{ top: 36, right: 36, bottom: 36, left: 36 }}
        colors={["#40DBC1", "#FF5B45"]}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1]],
        }}
        tracksColor="#ff5b45"
        radialAxisStart={null}
        legends={[]} 
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '52%',
        transform: 'translate(-50%, -57%)',
        textAlign: 'center',
        fontSize: '2.0vw',
        fontWeight: 'bold',
        color: '#EEF3FE', 
      }}>
        {`${ratio}%`}
      </div>
    </div>
  );
};




export { BarChart };
export { DonutChart };
export { Top5_Bar };
export { DonutChartDetail }