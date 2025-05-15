import React from 'react';
import { Skeleton, Box } from '@mui/material';

type SkeletonType = 'text' | 'rectangular' | 'circular';

interface SkeletonItem {
  type: SkeletonType;
  width?: number | string;
  height?: number | string;
  count?: number;
}

interface SkeletonLoadingProps {
  items?: SkeletonItem[];
}

const SkeletonLoading = ({ items }: SkeletonLoadingProps) => {
  const defaultItems: SkeletonItem[] = [
    { type: 'rectangular', width: '100%', height: 300 },
    { type: 'text', width: '80%' },
    { type: 'text', width: '60%' },
    { type: 'rectangular', width: '100%', height: 150 },
  ];

  const skeletons = items ?? defaultItems;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {skeletons.map((item, index) => {
        const count = item.count ?? 1;
        return [...Array(count)].map((_, i) => (
          <Skeleton
            key={`${index}-${i}`}
            variant={item.type}
            width={item.width}
            height={item.height}
          />
        ));
      })}
    </Box>
  );
};

export default SkeletonLoading;
