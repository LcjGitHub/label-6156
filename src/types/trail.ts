/**
 * 海拔剖面采样点
 */
export interface ElevationPoint {
  /** 距起点里程（公里） */
  distance: number;
  /** 海拔高度（米） */
  elevation: number;
}

/**
 * 徒步路线
 */
export interface Trail {
  /** 唯一标识 */
  id: string;
  /** 路线名称 */
  name: string;
  /** 路线简介 */
  description: string;
  /** 总里程（公里） */
  distance: number;
  /** 累计爬升（米） */
  elevationGain: number;
  /** 预计耗时 */
  duration: string;
  /** 难度等级 */
  difficulty: string;
  /** 所在区域 */
  region: string;
  /** 海拔剖面数据 */
  elevationProfile: ElevationPoint[];
}
