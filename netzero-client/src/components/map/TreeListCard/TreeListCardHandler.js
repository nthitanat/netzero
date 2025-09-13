import styles from "./TreeListCard.module.scss";

const TreeListCardHandler = (stateTreeListCard, setTreeListCard, handlers) => {
  const { onTreeClick, onLocationMapView } = handlers || {};

  const getTreeTypeEmoji = (treeName) => {
    const treeEmojis = {
      "Teak": "🌲",
      "Siamese Rosewood": "🌳",
      "Padauk": "🌿",
      "Mango": "🥭",
      "Longan": "🍇",
      "Jackfruit": "🫚",
      "Bamboo": "🎋",
      "Burmese Grape": "🍇",
      "Indian Gooseberry": "🫐",
      "Others": "🌱",
      "Hopea odorata": "🌲",
      "Yang Na": "🌳",
      "Firewood (Unknown)": "🪵",
      "Banana": "🍌",
      "Chestnut": "🌰",
      "Garcinia": "🍊",
      "Vetiver Grass": "🌾",
      "Herbs (Unknown)": "🌿"
    };
    return treeEmojis[treeName] || "🌳";
  };

  const handleTreeClick = (tree) => {
    setTreeListCard("selectedTree", tree);
    if (onTreeClick) {
      onTreeClick(tree);
    }
  };

  const handleLocationMapView = (location) => {
    if (onLocationMapView) {
      onLocationMapView(location);
    }
  };

  const toggleTreeExpansion = (treeName) => {
    const { expandedTrees } = stateTreeListCard;
    const isExpanded = expandedTrees.includes(treeName);
    
    if (isExpanded) {
      setTreeListCard("expandedTrees", expandedTrees.filter(name => name !== treeName));
    } else {
      setTreeListCard("expandedTrees", [...expandedTrees, treeName]);
    }
  };

  return {
    getTreeTypeEmoji,
    handleTreeClick,
    handleLocationMapView,
    toggleTreeExpansion
  };
};

export default TreeListCardHandler;
