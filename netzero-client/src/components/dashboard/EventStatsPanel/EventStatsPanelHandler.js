const EventStatsPanelHandler = (stateEventStatsPanel, setEventStatsPanel, callbacks) => {
  const { onRefresh } = callbacks;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const calculateTrends = (stats) => {
    if (!stats) return null;

    const totalEvents = stats.totalEvents || 0;
    const completedEvents = stats.completedEvents || 0;
    const activeEvents = stats.activeEvents || 0;
    const cancelledEvents = stats.cancelledEvents || 0;

    return {
      successRate: totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0,
      activeRate: totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 0,
      cancelRate: totalEvents > 0 ? (cancelledEvents / totalEvents) * 100 : 0,
      participationRate: stats.averageParticipants || 0
    };
  };

  const getPerformanceLabel = (stats) => {
    if (!stats || stats.totalEvents === 0) return 'ยังไม่มีข้อมูล';

    const trends = calculateTrends(stats);
    
    if (trends.successRate >= 80 && trends.participationRate >= 20) {
      return 'ยอดเยี่ยม';
    } else if (trends.successRate >= 60 && trends.participationRate >= 10) {
      return 'ดี';
    } else if (trends.successRate >= 40) {
      return 'ปานกลาง';
    } else {
      return 'ต้องพัฒนา';
    }
  };

  const formatStatValue = (value, type = 'number') => {
    if (typeof value !== 'number') return '0';
    
    switch (type) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'currency':
        return value.toLocaleString('th-TH');
      case 'decimal':
        return value.toFixed(1);
      default:
        return value.toLocaleString('th-TH');
    }
  };

  const getStatColor = (value, thresholds = { good: 80, fair: 50 }) => {
    if (value >= thresholds.good) return 'success';
    if (value >= thresholds.fair) return 'info';
    return 'warning';
  };

  return {
    handleRefresh,
    calculateTrends,
    getPerformanceLabel,
    formatStatValue,
    getStatColor,
  };
};

export default EventStatsPanelHandler;