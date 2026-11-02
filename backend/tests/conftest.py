import pytest
import pytest_asyncio
from app.db.init_db import init_db_and_seed


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    await init_db_and_seed()
