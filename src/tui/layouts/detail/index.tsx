import React from "react";
import { Box } from "ink";
import ContentContainer from "../../components/ContentContainer.js";
import DetailRow from "./DetailRow.js";
import DetailEntryOptions from "./DetailEntryOptions.js";
import UsageInfo from "../../components/UsageInfo.js";
import { useBoundStore } from "../../store/index.js";

const Detail: React.FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);

  if (!detailedEntry) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <ContentContainer>
        {Object.entries(detailedEntry)
          .filter(([key]) => key !== "downloadUrls")
          .map(([key, value], idx) => (
            <DetailRow
              key={idx}
              label={key === "id" ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}
              description={value}
            />
          ))}
        <DetailEntryOptions />
      </ContentContainer>
      <UsageInfo />
    </Box>
  );
};

export default Detail;
