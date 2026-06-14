import { useNavigate } from 'react-router-dom';
import { Table, Typography, Card } from '@douyinfe/semi-ui';
import type { Trail } from '../types/trail';
import { getAllTrails } from '../utils/trails';

const { Title, Text } = Typography;

/**
 * 路线列表页
 */
export function TrailList() {
  const navigate = useNavigate();
  const trails = getAllTrails();

  const columns = [
    {
      title: '路线名称',
      dataIndex: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '里程 (km)',
      dataIndex: 'distance',
      width: 120,
      render: (distance: number) => distance.toFixed(1),
    },
    {
      title: '累计爬升 (m)',
      dataIndex: 'elevationGain',
      width: 140,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 120,
    },
    {
      title: '区域',
      dataIndex: 'region',
    },
  ];

  return (
    <div className="page-container">
      <Card>
        <Title heading={3} style={{ marginBottom: 16 }}>
          徒步路线列表
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          点击行查看路线详情与海拔剖面图
        </Text>
        <Table<Trail>
          columns={columns}
          dataSource={trails}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              if (record) {
                navigate(`/trail/${record.id}`);
              }
            },
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
