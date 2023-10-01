import React from "react";
import { Text, useInput, Key } from "ink";
import figures from "figures";

import { IResultListItemOption } from "../../../api/models/ListItem.js";
import { useBoundStore } from "../../store/index.js";

const ResultListItemOption: React.FC<{
  item: IResultListItemOption;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const anyEntryExpanded = useBoundStore((state) => state.anyEntryExpanded);

  useInput(
    (_, key: Key) => {
      if (key.return) {
        item.data.onSelect();
      }
    },
    { isActive }
  );

  return (
    <Text
      wrap="truncate"
      color={anyEntryExpanded ? "gray" : isActive ? "cyanBright" : "yellow"}
      bold={isActive}
    >
      {isActive && figures.pointer} {item.data.label}
    </Text>
  );
};

export default ResultListItemOption;