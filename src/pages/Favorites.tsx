import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Typography, Button, Empty, Space, Modal, Toast } from '@douyinfe/semi-ui';
import { IconStar, IconArrowLeft, IconDelete, IconClose } from '@douyinfe/semi-icons';
import type { Trail } from '../types/trail';
import { getAllTrails } from '../utils/trails';
import { getFavoriteIds, removeFavorite, clearAllFavorites } from '../utils/favorites';

const { Title, Text } = Typography;

/**
 * 收藏管理页
 *
 * 以卡片网格形式展示全部已收藏路线的名称、区域、里程和爬升信息，
 * 每张卡片右上角提供取消收藏按钮，页面顶部显示收藏总数并提供一键清空全部收藏的功能。
 */
export function Favorites() {
  const navigate = useNavigate();
  const trails = getAllTrails();
  const [refreshTick, setRefreshTick] = useState(0);

  const favoriteTrails = useMemo(() => {
    const favoriteIds = getFavoriteIds();
    return trails.filter((trail) => favoriteIds.includes(trail.id));
  }, [trails, refreshTick]);

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

  const handleRemoveFavorite = useCallback((trail: Trail) => {
    removeFavorite(trail.id);
    Toast.success(`已取消收藏「${trail.name}」`);
    refreshFavorites();
  }, [refreshFavorites]);

  const handleClearAll = useCallback(() => {
    if (favoriteTrails.length === 0) {
      return;
    }
    Modal.warning({
      title: '确认清空全部收藏',
      content: `您确定要清空全部 ${favoriteTrails.length} 条收藏路线吗？此操作不可撤销。`,
      okText: '确认清空',
      cancelText: '取消',
      onOk: () => {
        clearAllFavorites();
        Toast.success('已清空全部收藏');
        refreshFavorites();
      },
    });
  }, [favoriteTrails.length, refreshFavorites]);

  return (
    <div className="page-container">
      <Button
        icon={<IconArrowLeft />}
        theme="borderless"
        onClick={() => navigate('/')}
        style={{ marginBottom: 16 }}
        aria-label="返回徒步路线列表页"
      >
        返回列表
      </Button>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <Space spacing={12} align="center">
            <IconStar style={{ color: '#FFC107', fontSize: 24 }} />
            <Title heading={3} style={{ margin: 0 }}>
              我的收藏
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              共 {favoriteTrails.length} 条收藏路线
            </Text>
          </Space>
          <Button
            icon={<IconDelete />}
            type="danger"
            theme="light"
            onClick={handleClearAll}
            disabled={favoriteTrails.length === 0}
            aria-label="清空全部收藏"
          >
            清空全部
          </Button>
        </div>

        {favoriteTrails.length === 0 ? (
          <Empty
            title="还没有收藏的路线"
            description="前往路线详情页点击收藏按钮添加收藏"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <div
            role="region"
            aria-label="收藏路线卡片列表"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {favoriteTrails.map((trail) => (
              <div
                key={trail.id}
                style={{
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onClick={() => navigate(`/trail/${trail.id}`)}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  const target = e.currentTarget;
                  target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  const target = e.currentTarget;
                  target.style.transform = 'translateY(0)';
                }}
              >
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    height: '100%',
                  }}
                  bodyStyle={{
                    padding: 20,
                    position: 'relative',
                  }}
                >
                <Button
                  icon={<IconClose />}
                  theme="borderless"
                  size="small"
                  aria-label={`取消收藏「${trail.name}」`}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(0,0,0,0.35)',
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleRemoveFavorite(trail);
                  }}
                />

                <Space spacing={8} align="center" style={{ marginBottom: 12 }}>
                  <IconStar style={{ color: '#FFC107' }} />
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      paddingRight: 32,
                    }}
                    title={trail.name}
                  >
                    {trail.name}
                  </Text>
                </Space>

                <Text
                  type="tertiary"
                  style={{
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 16,
                  }}
                >
                  {trail.region}
                </Text>

                <div
                  style={{
                    display: 'flex',
                    gap: 20,
                  }}
                >
                  <div
                    role="region"
                    aria-label={`里程 ${trail.distance.toFixed(1)} 公里`}
                    style={{ flex: 1 }}
                  >
                    <Text
                      type="tertiary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      里程
                    </Text>
                    <Text
                      strong
                      style={{
                        fontSize: 20,
                        color: '#3370ff',
                      }}
                    >
                      {trail.distance.toFixed(1)}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        marginLeft: 2,
                      }}
                    >
                      km
                    </Text>
                  </div>
                  <div
                    role="region"
                    aria-label={`累计爬升 ${trail.elevationGain} 米`}
                    style={{ flex: 1 }}
                  >
                    <Text
                      type="tertiary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      累计爬升
                    </Text>
                    <Text
                      strong
                      style={{
                        fontSize: 20,
                        color: '#ff8f1f',
                      }}
                    >
                      {trail.elevationGain}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        marginLeft: 2,
                      }}
                    >
                      m
                    </Text>
                  </div>
                </div>
              </Card>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
