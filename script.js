const servers = [
    { name: 'Bitcoin', region: 'Europe 1', url: 'https://btc-eu1.edge.app/' },
    { name: 'Bitcoin', region: 'West USA 1', url: 'https://btc-wusa1.edge.app/' },
    { name: 'Bitcoin Cash', region: 'East USA 1', url: 'https://bch-eusa1.edge.app/' },
    { name: 'Dash', region: 'West USA 1', url: 'https://dash-wusa1.edge.app/' },
    { name: 'DigiByte', region: 'Europe 1', url: 'https://dgb-eu1.edge.app/' },
    { name: 'Dogecoin', region: 'East USA 1', url: 'https://doge-eusa1.edge.app/' },
    { name: 'Firo', region: 'East USA 1', url: 'https://firo-eusa1.edge.app/' },
    { name: 'Litecoin', region: 'West USA 1', url: 'https://ltc-wusa1.edge.app/' },
    { name: 'PIVX', region: 'East USA 1', url: 'https://pivx-eusa1.edge.app/' },
    { name: 'Qtum', region: 'West USA 1', url: 'https://qtum-wusa1.edge.app/' },
    { name: 'Vertcoin', region: 'West USA 1', url: 'https://vtc-wusa1.edge.app/' }
];

function getTimeSince(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours % 24} hour${diffHours % 24 !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMins % 60} min${diffMins % 60 !== 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
        return 'just now';
    }
}

async function checkServerStatus(server) {
    try {
        const apiUrl = `${server.url}api/v2`;
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;

        let lastError = null;
        let response = null;

        // Try up to 3 times for 500 errors
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                response = await fetch(proxyUrl, {
                    method: 'GET',
                    cache: 'no-cache'
                });

                // If successful or not a 500 error, break out
                if (response.ok || response.status !== 500) {
                    break;
                }

                // It's a 500 error, log and retry
                lastError = `HTTP ${response.status}`;
                if (attempt < 2) {
                    console.log(`${server.name} (${server.region}): 500 error, retrying (${attempt + 1}/2)...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (fetchError) {
                lastError = fetchError.message;
                if (fetchError.message.includes('500') && attempt < 2) {
                    console.log(`${server.name} (${server.region}): error, retrying (${attempt + 1}/2)...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    throw fetchError;
                }
            }
        }

        if (!response.ok) {
            throw new Error(lastError || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const blockbook = data.blockbook || {};
        const backend = data.backend || {};

        // Determine actual health status
        let status = 'online';
        let warnings = [];
        let errors = [];

        // Check for backend errors
        if (backend.error) {
            status = 'error';
            errors.push(`Backend error: ${backend.error}`);
        }

        // Check for backend warnings
        if (backend.warnings && backend.warnings.trim()) {
            if (status === 'online') status = 'warning';
            warnings.push(backend.warnings.trim());
        }

        // Check sync status
        if (blockbook.inSync === false) {
            if (status === 'online') status = 'warning';
            warnings.push('Blockbook not synchronized');
        }

        // Check mempool sync
        if (blockbook.inSyncMempool === false) {
            if (status === 'online') status = 'warning';
            warnings.push('Mempool not synchronized');
        }

        // Check last block age
        if (blockbook.lastBlockTime) {
            const lastBlockDate = new Date(blockbook.lastBlockTime);
            const hoursSinceLastBlock = (new Date() - lastBlockDate) / (1000 * 60 * 60);

            if (hoursSinceLastBlock > 24) {
                status = 'error';
                errors.push(`Last block was ${Math.floor(hoursSinceLastBlock / 24)} days ago - chain may be stalled`);
            } else if (hoursSinceLastBlock > 2) {
                if (status === 'online') status = 'warning';
                warnings.push(`Last block was ${Math.floor(hoursSinceLastBlock)} hours ago`);
            }
        }

        return {
            status,
            blockbook,
            backend,
            warnings,
            errors,
            error: null
        };
    } catch (error) {
        return {
            status: 'offline',
            blockbook: {},
            backend: {},
            warnings: [],
            errors: [],
            error: error.message
        };
    }
}

function createServerCard(server, statusData) {
    const card = document.createElement('div');
    card.className = 'server-card';

    // Add click handler for mobile expand/collapse
    card.addEventListener('click', function(e) {
        // Only on mobile screens (768px or less)
        if (window.innerWidth <= 768) {
            // Don't toggle if clicking on the link
            if (e.target.closest('.server-link')) {
                return;
            }
            card.classList.toggle('expanded');
        }
    });

    // Determine status indicator class
    let statusClass = 'offline';
    let statusText = 'OFFLINE';

    if (statusData.status === 'online') {
        statusClass = 'online';
        statusText = 'HEALTHY';
    } else if (statusData.status === 'warning') {
        statusClass = 'warning';
        statusText = 'DEGRADED';
    } else if (statusData.status === 'error') {
        statusClass = 'error';
        statusText = 'ERROR';
    } else if (statusData.status === 'checking') {
        statusClass = 'checking';
        statusText = 'CHECKING';
    }

    const blockHeight = statusData.backend.blocks || statusData.blockbook.bestHeight || 'N/A';
    const version = statusData.blockbook.version || 'N/A';
    const coin = statusData.blockbook.coin || 'N/A';
    const inSync = statusData.blockbook.inSync !== undefined ? statusData.blockbook.inSync : 'N/A';
    const inSyncMempool = statusData.blockbook.inSyncMempool !== undefined ? statusData.blockbook.inSyncMempool : 'N/A';

    const lastBlockTime = statusData.blockbook.lastBlockTime
        ? getTimeSince(statusData.blockbook.lastBlockTime)
        : 'N/A';

    const lastMempoolTime = statusData.blockbook.lastMempoolTime
        ? getTimeSince(statusData.blockbook.lastMempoolTime)
        : 'N/A';

    // Build warnings HTML
    let warningsHtml = '';
    if (statusData.warnings && statusData.warnings.length > 0) {
        warningsHtml = statusData.warnings.map(warning =>
            `<div class="warning-message">⚠️ ${warning}</div>`
        ).join('');
    }

    // Build errors HTML
    let errorsHtml = '';
    if (statusData.errors && statusData.errors.length > 0) {
        errorsHtml = statusData.errors.map(error =>
            `<div class="error-message">❌ ${error}</div>`
        ).join('');
    }

    // API connection error
    if (statusData.error) {
        errorsHtml += `<div class="error-message">❌ Connection failed: ${statusData.error}</div>`;
    }

    card.innerHTML = `
        <div class="server-header">
            <div class="server-title">
                <div class="server-name">${server.name}</div>
                <div class="server-region">${server.region}</div>
            </div>
            <div class="status-indicator ${statusClass}"></div>
        </div>
        <div class="server-info">
            <div class="info-row" data-field="status">
                <span class="info-label">Status</span>
                <span class="info-value status-${statusClass}">${statusText}</span>
            </div>
            ${statusData.status !== 'offline' && statusData.status !== 'checking' ? `
                <div class="info-row" data-field="coin">
                    <span class="info-label">Coin</span>
                    <span class="info-value">${coin}</span>
                </div>
                <div class="info-row" data-field="block-height">
                    <span class="info-label">Block Height</span>
                    <span class="info-value">${typeof blockHeight === 'number' ? blockHeight.toLocaleString() : blockHeight}</span>
                </div>
                <div class="info-row" data-field="synchronized">
                    <span class="info-label">Synchronized</span>
                    <span class="info-value ${inSync === true ? 'status-good' : 'status-bad'}">${inSync === true ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div class="info-row" data-field="last-block">
                    <span class="info-label">Last Block</span>
                    <span class="info-value">${lastBlockTime}</span>
                </div>
                <div class="info-row" data-field="mempool-sync">
                    <span class="info-label">Mempool Sync</span>
                    <span class="info-value ${inSyncMempool === true ? 'status-good' : 'status-bad'}">${inSyncMempool === true ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div class="info-row" data-field="last-mempool">
                    <span class="info-label">Last Mempool Update</span>
                    <span class="info-value">${lastMempoolTime}</span>
                </div>
                <div class="info-row" data-field="version">
                    <span class="info-label">Version</span>
                    <span class="info-value">${version}</span>
                </div>
            ` : ''}
        </div>
        ${warningsHtml}
        ${errorsHtml}
        <a href="${server.url}" target="_blank" class="server-link">Visit Server →</a>
    `;

    return card;
}

let isFirstLoad = true;
let currentStatuses = [];

function getChangedFields(oldStatus, newStatus) {
    if (!oldStatus || !newStatus) return null; // null means "all fields" (first load)

    const changes = [];

    // Compare key fields to detect changes
    const oldBlock = oldStatus.backend?.blocks || oldStatus.blockbook?.bestHeight;
    const newBlock = newStatus.backend?.blocks || newStatus.blockbook?.bestHeight;

    if (oldStatus.status !== newStatus.status) changes.push('status');
    if (oldBlock !== newBlock) changes.push('block-height');
    if (oldStatus.blockbook?.inSync !== newStatus.blockbook?.inSync) changes.push('synchronized');
    if (oldStatus.blockbook?.inSyncMempool !== newStatus.blockbook?.inSyncMempool) changes.push('mempool-sync');
    if (oldStatus.blockbook?.lastBlockTime !== newStatus.blockbook?.lastBlockTime) changes.push('last-block');
    if (oldStatus.blockbook?.lastMempoolTime !== newStatus.blockbook?.lastMempoolTime) changes.push('last-mempool');
    if (oldStatus.blockbook?.version !== newStatus.blockbook?.version) changes.push('version');
    if (oldStatus.blockbook?.coin !== newStatus.blockbook?.coin) changes.push('coin');

    return changes;
}

async function updateDashboard() {
    const container = document.getElementById('servers-container');

    // On first load, create all cards with initial-load class
    if (isFirstLoad) {
        container.innerHTML = '';
        servers.forEach((server, index) => {
            const card = createServerCard(server, { status: 'checking', blockbook: {}, backend: {}, warnings: [], errors: [], error: null });
            card.setAttribute('data-server-index', index);
            card.classList.add('initial-load');
            container.appendChild(card);
        });
    }

    const cards = container.querySelectorAll('.server-card');

    // Start all server checks independently - update each card as soon as its data arrives
    servers.forEach((server, index) => {
        checkServerStatus(server).then(newStatus => {
            const card = cards[index];
            const oldStatus = currentStatuses[index];

            // Get which fields changed
            const changedFields = getChangedFields(oldStatus, newStatus);

            // On first load (changedFields is null) or when data changed (changedFields has items)
            if (changedFields === null || changedFields.length > 0) {
                const newCard = createServerCard(server, newStatus);
                card.innerHTML = newCard.innerHTML;

                // Remove initial-load class immediately on first update
                card.classList.remove('initial-load');

                // Add pulse animation whenever data updates (not on first load)
                if (changedFields !== null) {
                    card.classList.remove('data-updated');
                    void card.offsetWidth; // Trigger reflow
                    card.classList.add('data-updated');

                    // Highlight specific changed fields
                    changedFields.forEach(field => {
                        const row = card.querySelector(`[data-field="${field}"]`);
                        if (row) {
                            row.classList.add('field-updated');
                        }
                    });

                    // Remove animation classes after they complete
                    setTimeout(() => {
                        card.classList.remove('data-updated');
                        card.querySelectorAll('.field-updated').forEach(row => {
                            row.classList.remove('field-updated');
                        });
                    }, 1500);
                }
            }

            // Store current status for next comparison
            currentStatuses[index] = newStatus;
        });
    });

    if (isFirstLoad) {
        isFirstLoad = false;
    }

    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
}

document.getElementById('refresh-btn').addEventListener('click', updateDashboard);

updateDashboard();

// Poll every 15 seconds
setInterval(updateDashboard, 15000);
