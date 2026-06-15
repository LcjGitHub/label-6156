import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Typography, Card, Switch, Space, Empty } from '@douyinfe/semi-ui';
import { IconStar, IconStarStroked } from '@douyinfe/semi-icons';
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
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshFavorites = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFavorites();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refreshFavorites);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refreshFavorites);
    };
  }, [refreshFavorites]);

  const filteredTrails = useMemo(() => {
    const favoriteIds = getFavoriteIds();
    const trailsWithFavorite = trails.map((trail) => ({
      ...trail,
      _favorited: favoriteIds.includes(trail.id),
    }));
    if (!showFavoritesOnly) {
      return trailsWithFavorite;
    }
    return trailsWithFavorite.filter((trail) => trail._favorited);
  }, [trails, showFavoritesOnly, refreshTick]);

  const columns = [
    {
      title: '收藏',
      dataIndex: '_favorited',
      width: 70,
      align: 'center' as const,
      render: (favorited: boolean) =>
        favorited ? (
          <IconStar style={{ color: '#FFC107' }} />
        ) : (
          <IconStarStroked style={{ color: 'rgba(0,0,0,0.25)' }} />
        ),
    },
    {
      title: '路线名称',
      dataIndex: 'name',
      render: (name: string, record: Trail & { _favorited: boolean }) => (
        <Text strong>
          {name}
          {record._favorited && (
            <Text type="tertiary" style={{ marginLeft: 8, fontSize: 12 }}>
              ★
            </Text>
          )}
        </Text>
      ),
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
            {showFavoritesOnly ? (
              <IconStar style={{ color: '#FFC107' }} />
            ) : (
              <IconStarStroked />
            )}
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
        {showFavoritesOnly && filteredTrails.length === 0 ? (
          <Empty
            title="还没有收藏的路线"
            description="前往路线详情页点击收藏按钮添加收藏"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table<Trail & { _favorited: boolean }>
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
        )}
      </Card>
    </div>
  );
}
