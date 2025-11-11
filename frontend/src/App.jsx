import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState("market_cap_sol");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
  let ws;

  async function fetchInitialData() {
    try {
      const res = await fetch("http://localhost:8000/api/tokens?limit=100&sortBy=market_cap_sol&order=desc");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTokens(json.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to load initial token data:", err);
    }
  }

  function connectWebSocket() {
    ws = new WebSocket("ws://localhost:8000/ws/tokens/info");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          console.log("Live update received:", data.length, "tokens");
          setTokens(data);
        }
      } catch (err) {
        console.warn("Invalid WebSocket data:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed, reconnecting in 3s...");
      setTimeout(connectWebSocket, 3000); // auto-reconnect
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };
  }

  fetchInitialData().then(connectWebSocket);

  return () => {
    if (ws) ws.close();
  };
}, []);


  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredTokens =
    tokens &&
    tokens
      .filter(
        (t) =>
          t.token_name.toLowerCase().includes(search.toLowerCase()) ||
          t.token_ticker.toLowerCase().includes(search.toLowerCase()) ||
          t.protocol.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string") return valA.localeCompare(valB);
        return sortAsc ? valA - valB : valB - valA;
      });

  if (isLoading) {
    return (
      <div className="loadDiv">
        <div className="loadCon">
          <div className="loadSpin"></div>
          <p className="loadTxt">
            Loading token data...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && tokens.length === 0) {
    return (
      <div className="loadDis">
        <h2 className="noToken">
          No token data available
        </h2>
        <p className="wait">
          Waiting for cache updates from server...
        </p>
      </div>
    );
  }

  return (
    <div className="input">
      <header className="title">
        <h1 className="head">
          Solana Token Dashboard
        </h1>
        <input
          type="text"
          placeholder="Search by name, ticker, or protocol..."
          className="textbox"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="overall">
        <table className="table">
          <thead className="headAll">
            <tr>
              <th className="rowHead" onClick={() => handleSort("token_name")}>
                Token
              </th>
              <th className="rowHead" onClick={() => handleSort("token_ticker")}>
                Ticker
              </th>
              <th className="rowHead" onClick={() => handleSort("price_sol")}>
                Price (SOL)
              </th>
              <th className="rowHead" onClick={() => handleSort("market_cap_sol")}>
                Market Cap (SOL)
              </th>
              <th className="rowHead" onClick={() => handleSort("volume_sol")}>
                24h Volume (SOL)
              </th>
              <th className="rowHead" onClick={() => handleSort("liquidity_sol")}>
                Liquidity (SOL)
              </th>
              <th className="rowHead" onClick={() => handleSort("transaction_count")}>
                Tx Count
              </th>
              <th className="rowHead" onClick={() => handleSort("price_1hr_change")}>
                1h Change (%)
              </th>
              <th className="rowHead" onClick={() => handleSort("protocol")}>
                Protocol
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens &&
              filteredTokens.map((t) => (
                <tr
                  key={t.token_address}
                  className="filter"
                >
                  <td className="special">
                    {t.token_name}
                  </td>
                  <td className="cell">{t.token_ticker}</td>
                  <td className="cell">{t.price_sol.toFixed(8)}</td>
                  <td className="cell">{t.market_cap_sol.toLocaleString()}</td>
                  <td className="cell">{t.volume_sol.toLocaleString()}</td>
                  <td className="cell">{t.liquidity_sol.toLocaleString()}</td>
                  <td className="cell">{t.transaction_count}</td>
                  <td
                    className={`change ${
                      t.price_1hr_change > 0
                        ? "green"
                        : t.price_1hr_change < 0
                        ? "red"
                        : "gray"
                    }`}
                  >
                    {t.price_1hr_change.toFixed(2)}%
                  </td>
                  <td className="cell">{t.protocol}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
