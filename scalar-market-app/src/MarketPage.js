import './styles/MarketPage.css';
import InfiniteScroll from './components/InfiniteScroll.js';
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Grid, Card, CardContent, Typography,Box, Page } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MarketPage() {
  const [marketData, setMarketData] = useState([]);
  const [searchTerm, setSearchterm] = useState('');
  const navigate = useNavigate();
  const handleSearchChange = (event) =>{
    setSearchterm(event.target.value);
  };

  const filteredData = marketData.filter((data) =>{
    return data.ticker.toLowerCase().includes(searchTerm.toLowerCase());
  })
  useEffect(() => {
    fetch('http://localhost:3001/get-markets')
      .then((response) => response.json())
      .then((data) => {
        const transformedData = data.map(item => ({
          ...item,
          id: item._id, // Transform _id to id
        }));
        setMarketData(transformedData);
      })
      .catch((error) => console.error("Fetching data error:", error));
  }, []);

  const columns = [
    {
      field: 'ticker',
      headerName: 'Ticker',
      width: 150,
      editable: true,
    },
    {
      field: 'rangeOpen',
      headerName: 'Range Open',
      type: 'number',
      width: 150,
      editable: true,
    },
    {
      field: 'rangeClose',
      headerName: 'Range Close',
      type: 'number',
      width: 150,
      editable: true,
    },
    {
      field: 'expiry',
      headerName: 'Expiry',
      type: 'date',
      width: 110,
      editable: true,
      valueGetter: (params) => params.row && params.row.expiry ? new Date(params.row.expiry) : null,
    },
    {
      field: 'block_expiry',
      headerName: 'Block Expiry',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 160,
      editable: true,
    },
  ];


  return (

    <Card >
    <CardContent >
      <Box   sx={{ mb: 2  }}>
        <Typography align='center'  color= 'inherit'variant="h5" gutterBottom>
          Trending Markets
        </Typography>
        <TextField
          fullWidth
          label="Search Markets"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <div style={{ height: 450, width: '100%', padding: "20px" }}>
        <DataGrid
          sx={{ borderRadius: "30px", marginTop:"30px", borderWidth: "2px", borderColor: "black", padding: "10px"  }}
          rows={filteredData}
          columns={columns}
          pageSize={5}
          disableSelectionOnClick
          getRowId={(row) => row._id}
          onRowClick={(params) => {
            navigate(`/market/${params.id}`);
          }}
        />
      </div>
    </CardContent>
  </Card>

  );
}

export default MarketPage;
