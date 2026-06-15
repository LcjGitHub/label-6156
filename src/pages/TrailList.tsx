import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Table, Typography, Card, Switch, Space } from '@douyinfe/semi-ui';
import { IconStar } from '@douyinfe/semi-icons';
import type { Trail } from '../types/trail';
import { getAllTrails } from '../utils/trails';
import { getFavoriteIds } from '../utils/favorites';

const { Title, Text } = Typography;

/**
 * 路线列表页
 */
export function TrailList() {
  const navigate = useNavigate();
  const trails = getAllTrails();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredTrails = useMemo(() => {
    if (!showFavoritesOnly) {
      return trails;
    }
    const favoriteIds = getFavoriteIds();
    return trails.filter((trail) => favoriteIds.includes(trail.id));
  }, [trails, showFavoritesOnly]);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title heading={3} style={{ margin: 0 }}>
            徒步路线列表
          </Title>
          <Space>
            <IconStar style={{ color: '#FFC107' }} />
            <Text>只看收藏</Text>
            <Switch
              checked={showFavoritesOnly}
              onChange={(checked) => setShowFavoritesOnly(checked)}
            />
          </Space>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          点击行查看路线详情与海拔剖面图
          {showFavoritesOnly && `（当前仅显示 ${filteredTrails.length} 条收藏路线）`}
        </Text>
        <Table<Trail>
          columns={columns}
          dataSource={filteredTrails}
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
