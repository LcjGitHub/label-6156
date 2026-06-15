import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Typography, Card, Switch, Space, Empty, Select, Button, Tag, Toast, Input } from '@douyinfe/semi-ui';
import { IconStar, IconStarStroked, IconRefresh, IconHistory, IconLayers, IconSearch, IconClose } from '@douyinfe/semi-icons';
import type { Trail } from '../types/trail';
import {
  getAllTrails,
  getAllDifficulties,
  getGroupedRegions,
  filterTrails,
  sortByField,
  toggleSortState,
  type TrailFilter,
  type SortDirection,
} from '../utils/trails';
import { getFavoriteIds } from '../utils/favorites';
import { getHistory, type HistoryItem } from '../utils/history';

const { Title, Text } = Typography;

/**
 * 路线列表页
 */
export function TrailList() {
  const navigate = useNavigate();
  const trails = getAllTrails();
  const difficulties = getAllDifficulties();
  const groupedRegions = getGroupedRegions();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filter, setFilter] = useState<TrailFilter>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const hasActiveFilter = !!(filter.difficulty || filter.region || filter.keyword);

  const sortFieldLabelMap: Record<string, string> = {
    distance: '里程',
    elevationGain: '累计爬升',
  };

  const sortDescription = sortField && sortDirection
    ? `，按${sortFieldLabelMap[sortField] || sortField}${sortDirection === 'asc' ? '升序' : '降序'}排列`
    : '';

  const refreshFavorites = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilter({});
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedRowKeys.length !== 2) {
      Toast.warning('请恰好选择两条路线进行对比');
      return;
    }
    navigate(`/compare?ids=${selectedRowKeys.join(',')}`);
  }, [selectedRowKeys, navigate]);

  const handleSort = useCallback((field: string) => {
    const result = toggleSortState(sortField, sortDirection, field);
    setSortField(result.field);
    setSortDirection(result.direction);
  }, [sortField, sortDirection]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFavorites();
        refreshHistory();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', () => {
      refreshFavorites();
      refreshHistory();
    });
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refreshFavorites);
    };
  }, [refreshFavorites, refreshHistory]);

  const filteredTrails = useMemo(() => {
    const favoriteIds = getFavoriteIds();
    const filteredByConditions = filterTrails(trails, filter);
    const trailsWithFavorite = filteredByConditions.map((trail) => ({
      ...trail,
      _favorited: favoriteIds.includes(trail.id),
    }));
    const filteredResult = showFavoritesOnly
      ? trailsWithFavorite.filter((trail) => trail._favorited)
      : trailsWithFavorite;
    return sortByField(filteredResult, sortField as keyof typeof filteredResult[0] | null, sortDirection);
  }, [trails, filter, showFavoritesOnly, refreshTick, sortField, sortDirection]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: (string | number)[] | undefined) => {
      const newKeys = keys ? keys.map(String) : [];
      if (newKeys.length > 2) {
        Toast.warning('最多只能选择两条路线进行对比');
        return;
      }
      setSelectedRowKeys(newKeys);
    },
    getCheckboxProps: (record: Trail) => ({
      'aria-label': `选择 ${record.name}`,
      disabled: selectedRowKeys.length >= 2 && !selectedRowKeys.includes(record.id),
    }),
    selectAllText: '全选',
    hideSelectAll: filteredTrails.length > 2,
  };

  const renderSortIcon = (field: string) => {
    const isActive = sortField === field;
    if (!isActive) return null;
    return (
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          marginLeft: 6,
          fontSize: 10,
          lineHeight: 1,
          verticalAlign: 'middle',
        }}
      >
        <span
          style={{
            color: sortDirection === 'asc' ? '#1890ff' : 'rgba(0,0,0,0.25)',
            marginBottom: -2,
          }}
        >
          ▲
        </span>
        <span
          style={{
            color: sortDirection === 'desc' ? '#1890ff' : 'rgba(0,0,0,0.25)',
            marginTop: -2,
          }}
        >
          ▼
        </span>
      </span>
    );
  };

  const getSortAriaLabel = (field: string, label: string) => {
    if (sortField !== field) {
      return `${label}，未排序，点击按${label}升序排列`;
    }
    if (sortDirection === 'asc') {
      return `${label}，升序排列，点击按${label}降序排列`;
    }
    if (sortDirection === 'desc') {
      return `${label}，降序排列，点击取消排序`;
    }
    return `${label}，未排序，点击按${label}升序排列`;
  };

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
      minWidth: 180,
      render: (name: string, record: Trail & { _favorited: boolean }) => (
        <Text strong style={{ whiteSpace: 'nowrap' }}>
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
      title: (
        <span
          role="button"
          tabIndex={0}
          aria-label={getSortAriaLabel('distance', '里程')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}
          onClick={() => handleSort('distance')}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('distance'); } }}
        >
          里程 (km)
          {renderSortIcon('distance')}
        </span>
      ),
      dataIndex: 'distance',
      width: 120,
      render: (distance: number) => distance.toFixed(1),
    },
    {
      title: (
        <span
          role="button"
          tabIndex={0}
          aria-label={getSortAriaLabel('elevationGain', '累计爬升')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}
          onClick={() => handleSort('elevationGain')}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('elevationGain'); } }}
        >
          累计爬升 (m)
          {renderSortIcon('elevationGain')}
        </span>
      ),
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
      minWidth: 180,
    },
  ];

  return (
    <div className="page-container">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title heading={3} style={{ margin: 0 }}>
              徒步路线列表
            </Title>
            <Text
              link
              style={{ fontSize: 14, whiteSpace: 'nowrap' }}
              onClick={() => navigate('/stats')}
            >
              数据统计
            </Text>
          </div>
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
        {history.length > 0 && (
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: 'rgba(24, 144, 255, 0.04)', borderRadius: 6, border: '1px solid rgba(24, 144, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Space>
                <IconHistory style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>最近浏览：</Text>
              </Space>
              <Space wrap>
                {history.map((item) => (
                  <span
                    key={item.id}
                    className="history-tag"
                    style={{
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    onClick={() => navigate(`/trail/${item.id}`)}
                  >
                    <Tag
                      color="blue"
                      size="large"
                      style={{
                        padding: '4px 14px',
                        fontSize: 14,
                        borderRadius: 16,
                      }}
                    >
                      {item.name}
                    </Tag>
                  </span>
                ))}
              </Space>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 16, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 6 }}>
          <Text strong style={{ whiteSpace: 'nowrap' }}>筛选条件：</Text>
          <Input
            placeholder="搜索路线名称或区域"
            style={{ width: 260 }}
            prefix={<IconSearch />}
            suffix={
              filter.keyword ? (
                <IconClose
                  style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }}
                  onClick={() => setFilter({ ...filter, keyword: '' })}
                />
              ) : null
            }
            value={filter.keyword || ''}
            onChange={(value) => setFilter({ ...filter, keyword: value })}
          />
          <Select
            placeholder="选择难度"
            style={{ width: 180 }}
            value={filter.difficulty}
            onChange={(value) => setFilter({ ...filter, difficulty: value as string })}
            optionList={[
              { value: '', label: '全部难度' },
              ...difficulties.map((d) => ({ value: d, label: d })),
            ]}
          />
          <Select
            placeholder="选择区域"
            style={{ width: 220 }}
            value={filter.region}
            onChange={(value) => setFilter({ ...filter, region: value as string })}
          >
            <Select.Option value="">全部区域</Select.Option>
            {groupedRegions.map((group) => (
              <Select.OptGroup label={group.province} key={group.province}>
                {group.regions.map((region) => (
                  <Select.Option value={region} key={region}>
                    {region.replace(group.province, '')}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
          <Button
            icon={<IconRefresh />}
            onClick={handleResetFilter}
            disabled={!filter.difficulty && !filter.region && !filter.keyword}
          >
            重置
          </Button>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          点击行查看路线详情与海拔剖面图
          {showFavoritesOnly && !hasActiveFilter && `（当前仅显示 ${filteredTrails.length} 条收藏路线${sortDescription}）`}
          {!showFavoritesOnly && hasActiveFilter && (
            <>
              （筛选条件：
              {filter.keyword && `关键词="${filter.keyword}"`}
              {filter.keyword && (filter.difficulty || filter.region) && '，'}
              {filter.difficulty && `难度=${filter.difficulty}`}
              {filter.difficulty && filter.region && '，'}
              {filter.region && `区域=${filter.region}`}
              {`，共 ${filteredTrails.length} 条路线${sortDescription}）`}
            </>
          )}
          {showFavoritesOnly && hasActiveFilter && (
            <>
              （筛选条件：
              {filter.keyword && `关键词="${filter.keyword}"`}
              {filter.keyword && (filter.difficulty || filter.region) && '，'}
              {filter.difficulty && `难度=${filter.difficulty}`}
              {filter.difficulty && filter.region && '，'}
              {filter.region && `区域=${filter.region}`}
              {`，共 ${filteredTrails.length} 条收藏路线${sortDescription}）`}
            </>
          )}
        </Text>
        {filteredTrails.length === 0 ? (
          <Empty
            title={
              hasActiveFilter
                ? showFavoritesOnly
                  ? '没有符合条件的收藏路线'
                  : '没有符合条件的路线'
                : '还没有收藏的路线'
            }
            description={
              hasActiveFilter
                ? showFavoritesOnly
                  ? '请调整筛选条件、点击重置按钮，或前往路线详情页添加收藏'
                  : '请调整筛选条件或点击重置按钮恢复全部数据'
                : '前往路线详情页点击收藏按钮添加收藏'
            }
            style={{ padding: '40px 0' }}
          />
        ) : (
          <>
            <Table<Trail & { _favorited: boolean }>
              columns={columns}
              dataSource={filteredTrails}
              rowKey="id"
              pagination={false}
              rowSelection={rowSelection}
              style={{ paddingBottom: selectedRowKeys.length > 0 ? 80 : 0 }}
              onRow={(record) => ({
                onClick: (e: React.MouseEvent) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('input[type="checkbox"]') || target.closest('.semi-table-row-select')) {
                    return;
                  }
                  if (record) {
                    navigate(`/trail/${record.id}`);
                  }
                },
                style: { cursor: 'pointer' },
              })}
            />
            {selectedRowKeys.length > 0 && (
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#fff',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                  zIndex: 1000,
                }}
              >
                <Text type="secondary">
                  已选择 <Text strong style={{ color: '#3370ff' }}>{selectedRowKeys.length}</Text> 条路线
                  {selectedRowKeys.length !== 2 && (
                    <Text type="tertiary" style={{ marginLeft: 8 }}>
                      （请恰好选择 2 条进行对比）
                    </Text>
                  )}
                </Text>
                <Space>
                  <Button onClick={() => setSelectedRowKeys([])}>
                    取消选择
                  </Button>
                  <Button
                    type="primary"
                    theme="solid"
                    icon={<IconLayers />}
                    onClick={handleCompare}
                    disabled={selectedRowKeys.length !== 2}
                  >
                    对比选中路线
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
