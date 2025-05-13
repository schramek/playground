#!/bin/bash
set -euo pipefail

MODE="${MODE:-scan}"

if [ "$MODE" = "server" ]; then
    echo "[clam-av] Starting in server mode..."
    exec clamd -c /etc/clamav/clamd.conf
elif [ "$MODE" = "scan" ]; then
    clamscan -V
    echo ""
    echo -e "Scanning $SCANDIR"
    echo ""
    clamscan -r $SCANDIR $@
    echo ""
    echo -e "$( date -I'seconds' ) ClamAV scanning finished"
else
    echo -e "MODE not selected. Use MODE=scan or MODE=server"
fi
