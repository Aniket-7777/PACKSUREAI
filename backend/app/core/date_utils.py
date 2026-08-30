import datetime
from typing import Optional, Tuple

def parse_date_range(date_range: Optional[str]) -> Tuple[Optional[datetime.datetime], Optional[datetime.datetime]]:
    """
    Parses date range string into (start_datetime, end_datetime) tuple.
    Handles: 'today', 'yesterday', 'last-7-days'/'7d', 'month-to-date'/'30d', 'quarter'/'q1', 'all'
    """
    if not date_range:
        return None, None
        
    dr = str(date_range).strip().lower().replace('_', '-')
    if dr in ["all", "all-time", "undefined", "null", "none", "query(none)"]:
        return None, None
        
    now = datetime.datetime.utcnow()
    
    if dr in ["today", "day", "live", "live-feed"]:
        start = datetime.datetime(now.year, now.month, now.day, 0, 0, 0)
        return start, None
        
    if dr in ["yesterday", "prev-day", "previous-day"]:
        yest = now - datetime.timedelta(days=1)
        start = datetime.datetime(yest.year, yest.month, yest.day, 0, 0, 0)
        end = datetime.datetime(yest.year, yest.month, yest.day, 23, 59, 59, 999999)
        return start, end
        
    if dr in ["last-7-days", "7d", "7-days", "week", "last-week"]:
        start = now - datetime.timedelta(days=7)
        return start, None
        
    if dr in ["month-to-date", "30d", "month", "last-30-days", "30-days"]:
        # Match either month-to-date (from 1st of month) or last 30 days
        start = datetime.datetime(now.year, now.month, 1, 0, 0, 0)
        return start, None
        
    if dr in ["quarter", "q1", "q1-2026", "90d", "quarter-to-date"]:
        start = now - datetime.timedelta(days=90)
        return start, None
        
    return None, None
