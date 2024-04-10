import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const InfiniteList = () => {
  // Example state for your list items
  const [items, setItems] = useState(Array.from({ length: 20 }));
  const [hasMore, setHasMore] = useState(true);

  // Function to simulate loading more data
  const fetchMoreData = () => {
    if (items.length >= 100) {
      setHasMore(false);
      return;
    }
    // Simulate a fetch() call
    setTimeout(() => {
      setItems(items.concat(Array.from({ length: 20 })));
    }, 500);
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      {items.map((_, index) => (
        <div key={index} style={{ margin: "10px", border: "1px solid green" }}>
          Item {index + 1}
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default InfiniteList;