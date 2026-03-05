from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from functools import lru_cache
import time


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CoinGecko API Base URL
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

# Cache for API responses (simple in-memory cache)
cache = {}
CACHE_DURATION = 60  # 60 seconds


# Define Models
class CryptoPrice(BaseModel):
    id: str
    symbol: str
    name: str
    image: str
    current_price: float
    market_cap: float
    market_cap_rank: Optional[int] = None
    price_change_percentage_24h: Optional[float] = None
    total_volume: float
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    last_updated: str


class CryptoConversion(BaseModel):
    from_crypto: str
    to_crypto: str
    amount: float
    result: float


class TrendingCrypto(BaseModel):
    id: str
    name: str
    symbol: str
    market_cap_rank: Optional[int] = None
    thumb: str
    price_btc: float


# Helper function to check cache
def get_from_cache(key: str):
    if key in cache:
        timestamp, data = cache[key]
        if time.time() - timestamp < CACHE_DURATION:
            return data
    return None


def set_cache(key: str, data):
    cache[key] = (time.time(), data)


# CoinGecko API Functions
def fetch_top_cryptos(limit: int = 50, currency: str = "usd"):
    cache_key = f"top_cryptos_{limit}_{currency}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{COINGECKO_BASE_URL}/coins/markets"
        params = {
            "vs_currency": currency,
            "order": "market_cap_desc",
            "per_page": limit,
            "page": 1,
            "sparkline": False
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        set_cache(cache_key, data)
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching top cryptos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching crypto data: {str(e)}")


def fetch_crypto_price(crypto_id: str):
    cache_key = f"crypto_price_{crypto_id}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{COINGECKO_BASE_URL}/coins/{crypto_id}"
        params = {
            "localization": False,
            "tickers": False,
            "market_data": True,
            "community_data": False,
            "developer_data": False
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        set_cache(cache_key, data)
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching crypto price for {crypto_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching crypto data: {str(e)}")


def fetch_trending_cryptos():
    cache_key = "trending_cryptos"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{COINGECKO_BASE_URL}/search/trending"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        set_cache(cache_key, data)
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching trending cryptos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching trending data: {str(e)}")


def fetch_simple_price(ids: List[str], vs_currencies: List[str] = ["usd"]):
    cache_key = f"simple_price_{'_'.join(ids)}_{'_'.join(vs_currencies)}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{COINGECKO_BASE_URL}/simple/price"
        params = {
            "ids": ",".join(ids),
            "vs_currencies": ",".join(vs_currencies)
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        set_cache(cache_key, data)
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching simple price: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching price data: {str(e)}")


def fetch_market_chart(crypto_id: str, days: int = 7, currency: str = "usd"):
    cache_key = f"market_chart_{crypto_id}_{days}_{currency}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{COINGECKO_BASE_URL}/coins/{crypto_id}/market_chart"
        params = {
            "vs_currency": currency,
            "days": days
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        set_cache(cache_key, data)
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching market chart: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching chart data: {str(e)}")


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Crypto Portal API - Powered by CoinGecko"}


@api_router.get("/crypto/markets", response_model=List[CryptoPrice])
async def get_crypto_markets(limit: int = 50, currency: str = "usd"):
    """
    Get top cryptocurrencies by market cap
    """
    data = fetch_top_cryptos(limit, currency)
    return data


@api_router.get("/crypto/price/{crypto_id}")
async def get_crypto_price(crypto_id: str):
    """
    Get detailed price information for a specific cryptocurrency
    """
    data = fetch_crypto_price(crypto_id)
    return {
        "id": data["id"],
        "symbol": data["symbol"],
        "name": data["name"],
        "image": data["image"]["large"],
        "current_price": data["market_data"]["current_price"]["usd"],
        "market_cap": data["market_data"]["market_cap"]["usd"],
        "market_cap_rank": data["market_cap_rank"],
        "price_change_24h": data["market_data"]["price_change_percentage_24h"],
        "price_change_7d": data["market_data"]["price_change_percentage_7d"],
        "price_change_30d": data["market_data"]["price_change_percentage_30d"],
        "high_24h": data["market_data"]["high_24h"]["usd"],
        "low_24h": data["market_data"]["low_24h"]["usd"],
        "total_volume": data["market_data"]["total_volume"]["usd"],
        "circulating_supply": data["market_data"]["circulating_supply"],
        "total_supply": data["market_data"]["total_supply"],
        "description": data["description"]["en"][:500] if data["description"]["en"] else ""
    }


@api_router.get("/crypto/trending")
async def get_trending_cryptos():
    """
    Get trending cryptocurrencies
    """
    data = fetch_trending_cryptos()
    trending = []
    for item in data.get("coins", [])[:10]:
        coin = item["item"]
        trending.append({
            "id": coin["id"],
            "name": coin["name"],
            "symbol": coin["symbol"],
            "market_cap_rank": coin.get("market_cap_rank"),
            "thumb": coin["thumb"],
            "small": coin["small"],
            "price_btc": coin.get("price_btc", 0)
        })
    return trending


@api_router.get("/crypto/convert")
async def convert_crypto(from_crypto: str, to_crypto: str, amount: float = 1.0):
    """
    Convert between cryptocurrencies
    """
    # Get prices for both cryptocurrencies
    prices = fetch_simple_price([from_crypto, to_crypto], ["usd"])
    
    if from_crypto not in prices or to_crypto not in prices:
        raise HTTPException(status_code=404, detail="Cryptocurrency not found")
    
    from_price = prices[from_crypto]["usd"]
    to_price = prices[to_crypto]["usd"]
    
    # Convert: amount * from_price / to_price
    result = (amount * from_price) / to_price
    
    return {
        "from_crypto": from_crypto,
        "to_crypto": to_crypto,
        "amount": amount,
        "from_price_usd": from_price,
        "to_price_usd": to_price,
        "result": result
    }


@api_router.get("/crypto/search")
async def search_crypto(query: str):
    """
    Search for cryptocurrencies
    """
    try:
        url = f"{COINGECKO_BASE_URL}/search"
        params = {"query": query}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Return only top 10 results
        coins = data.get("coins", [])[:10]
        return [{
            "id": coin["id"],
            "name": coin["name"],
            "symbol": coin["symbol"],
            "market_cap_rank": coin.get("market_cap_rank"),
            "thumb": coin["thumb"],
            "large": coin["large"]
        } for coin in coins]
    except requests.exceptions.RequestException as e:
        logging.error(f"Error searching crypto: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching crypto: {str(e)}")


@api_router.get("/crypto/chart/{crypto_id}")
async def get_crypto_chart(crypto_id: str, days: int = 7, currency: str = "usd"):
    """
    Get historical price chart data for a cryptocurrency
    """
    data = fetch_market_chart(crypto_id, days, currency)
    
    # Format the data for frontend
    prices = data.get("prices", [])
    formatted_prices = [{"timestamp": price[0], "price": price[1]} for price in prices]
    
    return {
        "id": crypto_id,
        "days": days,
        "currency": currency,
        "prices": formatted_prices
    }


# Portfolio and Alerts Models
class PortfolioItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    crypto_id: str
    crypto_name: str
    crypto_symbol: str
    amount: float
    purchase_price: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PortfolioItemCreate(BaseModel):
    crypto_id: str
    crypto_name: str
    crypto_symbol: str
    amount: float
    purchase_price: float


class PriceAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    crypto_id: str
    crypto_name: str
    crypto_symbol: str
    target_price: float
    condition: str  # "above" or "below"
    active: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PriceAlertCreate(BaseModel):
    crypto_id: str
    crypto_name: str
    crypto_symbol: str
    target_price: float
    condition: str


# Portfolio Endpoints
@api_router.post("/portfolio", response_model=PortfolioItem)
async def add_portfolio_item(item: PortfolioItemCreate):
    """
    Add an item to portfolio
    """
    portfolio_obj = PortfolioItem(**item.model_dump())
    doc = portfolio_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.portfolio.insert_one(doc)
    return portfolio_obj


@api_router.get("/portfolio", response_model=List[PortfolioItem])
async def get_portfolio():
    """
    Get all portfolio items
    """
    items = await db.portfolio.find({}, {"_id": 0}).to_list(1000)
    
    for item in items:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return items


@api_router.delete("/portfolio/{item_id}")
async def delete_portfolio_item(item_id: str):
    """
    Delete a portfolio item
    """
    result = await db.portfolio.delete_one({"id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    return {"message": "Portfolio item deleted successfully"}


# Price Alert Endpoints
@api_router.post("/alerts", response_model=PriceAlert)
async def create_price_alert(alert: PriceAlertCreate):
    """
    Create a price alert
    """
    alert_obj = PriceAlert(**alert.model_dump())
    doc = alert_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.alerts.insert_one(doc)
    return alert_obj


@api_router.get("/alerts", response_model=List[PriceAlert])
async def get_price_alerts():
    """
    Get all active price alerts
    """
    alerts = await db.alerts.find({"active": True}, {"_id": 0}).to_list(1000)
    
    for alert in alerts:
        if isinstance(alert['timestamp'], str):
            alert['timestamp'] = datetime.fromisoformat(alert['timestamp'])
    
    return alerts


@api_router.delete("/alerts/{alert_id}")
async def delete_price_alert(alert_id: str):
    """
    Delete a price alert
    """
    result = await db.alerts.delete_one({"id": alert_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert deleted successfully"}


@api_router.patch("/alerts/{alert_id}")
async def update_alert_status(alert_id: str, active: bool):
    """
    Update alert active status
    """
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"active": active}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert updated successfully"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
