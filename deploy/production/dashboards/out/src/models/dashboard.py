from pydantic import BaseModel

class Dashboard(BaseModel):
    name: str
    trackedSymbols: list[str]
    unixTimestamp: int
