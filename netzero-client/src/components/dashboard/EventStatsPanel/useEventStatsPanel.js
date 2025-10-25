import { useState } from "react";

const useEventStatsPanel = (initialProps) => {
  const [stateEventStatsPanel, setState] = useState({
    stats: initialProps?.stats || null,
    ...initialProps
  });

  const setEventStatsPanel = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventStatsPanelField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateEventStatsPanel,
    setEventStatsPanel,
    toggleEventStatsPanelField,
  };
};

export default useEventStatsPanel;