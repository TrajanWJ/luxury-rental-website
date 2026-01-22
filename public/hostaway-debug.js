/**
 * HOSTAWAY DEBUG & EXTRACTION SUITE (Production Core)
 * --------------------------------------------------
 * Deploys globally to extract dates from Hostaway widgets, 
 * assassinate Book buttons (B2 Assassin), and sync state.
 * 
 * IMPROVEMENTS:
 * 1. Mutation Watcher for manual re-initialization.
 * 2. "Neighbor Walk" for date extraction.
 * 3. Robust Clear detection.
 */

(function () {
    console.log('🏗️ HOSTAWAY INTEGRATION: Loading...');

    // STATE MANAGEMENT
    // ----------------
    window.bookingContext = JSON.parse(localStorage.getItem('bookingContext') || '{"startDate":null,"endDate":null}');

    function updateBookingContext(field, value) {
        window.bookingContext = window.bookingContext || {};
        const oldVal = window.bookingContext[field];
        window.bookingContext[field] = value;

        if (oldVal !== value) {
            console.log(`🔄 State Update: ${field} = ${value}`);
            if (window.bookingContext.startDate && window.bookingContext.endDate) {
                localStorage.setItem('bookingContext', JSON.stringify(window.bookingContext));
            }
            window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: window.bookingContext }));
            updateDevPopup();
        }
    }

    window.updateBookingContext = updateBookingContext;

    window.clearContext = function () {
        console.log('🧹 FULL CLEAR SYNC: Widget + Local + Dev Popup');
        window.bookingContext = { startDate: null, endDate: null };
        localStorage.removeItem('bookingContext');
        window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: window.bookingContext }));
        updateDevPopup();
    };


    // B2 ASSASSIN (Global Button Killer)
    // ----------------------------------
    function deployB2Assassin() {
        if (window.b2AssassinActive) return;
        window.b2AssassinActive = true;

        function killBookButtons() {
            // 1. Find all potential buttons within Hostaway widgets
            const widgets = document.querySelectorAll('[id^="hostaway-calendar-widget"]');

            widgets.forEach(widget => {
                const btns = widget.querySelectorAll('button, [role="button"]');

                btns.forEach(btn => {
                    const text = (btn.innerText || btn.textContent || '').toLowerCase();

                    // --- SAFEGUARDS (Do NOT Remove) ---

                    // 🛑 PROTECT CLEAR BUTTON
                    // If text contains "clear", ignore this element immediately
                    if (text.includes('clear')) return;
                    // 🛑 PROTECT NAVIGATION (Arrows)
                    // If it looks like next/prev buttons
                    if (text.includes('<') || text.includes('>') || btn.className.includes('Nav')) return;
                    // 🛑 PROTECT CALENDAR DAYS
                    // Don't delete the actual dates
                    if (btn.className.includes('Day')) return;
                    // --- ASSASSINATION (Remove) ---

                    // 🎯 KILL TARGET
                    // If it matches Booking keywords or is a submit button
                    if (/book|stay|checkout|continue/.test(text) || btn.type === 'submit') {
                        // Hard Remove from DOM
                        btn.remove();
                        // Force Hide (just in case)
                        btn.style.setProperty('display', 'none', 'important');

                        console.log('🔪 B2 V2: Removed Button:', text);
                    }
                });
            });
        }

        killBookButtons();
        new MutationObserver(killBookButtons).observe(document.body, { childList: true, subtree: true });

        // CSS removed - JS logic above handles button removal more precisely
        console.log('🗡️ B2 ASSASSIN: ACTIVE SITE-WIDE');
    }

    // WATCHER: Manual Re-initialization
    // ---------------------------------
    function deployWatcher() {
        const observer = new MutationObserver((mutations) => {
            // Look for new hostaway-calendar-widget containers
            const containers = document.querySelectorAll('[id^="hostaway-calendar-widget"]');
            containers.forEach(container => {
                if (container.dataset.initialized) return;

                // If it's empty and doesn't have a loading placeholder, or is a fresh mount
                if (container.children.length === 0 || container.innerText.includes('Loading')) {
                    // We don't trigger the widgetFn here because listingId is unknown to the global script
                    // but we can flag it for the React component or use data attributes.
                    // The guide says: "manually triggers the initialization with the correct listingId"
                    // How do we get the listingId? From data attributes is best.
                    const listingId = container.getAttribute('data-listing-id');
                    const baseUrl = container.getAttribute('data-base-url') || 'https://wilson-premier.holidayfuture.com/';

                    if (listingId && window.hostawayCalendarWidget) {
                        console.log('👀 WATCHER detected container - Initializing for:', listingId);
                        container.dataset.initialized = "true";
                        window.hostawayCalendarWidget({
                            baseUrl: baseUrl,
                            listingId: Number(listingId),
                            containerId: container.id,
                            numberOfMonths: 2,
                            openInNewTab: true,
                            font: 'Inter, sans-serif',
                            rounded: true,
                            button: { action: 'checkout', text: 'Book Stay' },
                            clearButtonText: 'Clear dates',
                            color: { mainColor: '#2563eb', frameColor: '#f1f5f9', textColor: '#0f172a' },
                        });
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('👁️ CONTAINER WATCHER: ACTIVE');
    }


    function injectDevPopup() {
        if (document.getElementById('dev-state-popup')) return;

        const popup = document.createElement('div');
        popup.id = 'dev-state-popup';
        popup.className = 'visible';
        popup.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; width: 280px; 
            background: #0f172a; color: #e2e8f0; border-radius: 12px; 
            font-family: 'Inter', sans-serif; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); 
            z-index: 99999; border: 1px solid rgba(255,255,255,0.1); 
            font-size: 13px; backdrop-filter: blur(10px); opacity: 1; transition: opacity 0.3s;
        `;

        const style = document.createElement('style');
        style.textContent = `
            #dev-state-popup.hidden { opacity: 0; pointer-events: none; }
            #dev-state-popup .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
            #dev-state-popup label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
            #dev-state-popup .val { font-family: 'Fira Code', monospace; color: #f8fafc; }
            #dev-state-popup button.action { width: 100%; margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.1); border:none; color:white; border-radius: 6px; cursor: pointer; }
            #dev-state-popup.minimized .popup-body { display: none; }
            #dev-state-popup .popup-header { cursor: move; user-select: none; }
        `;
        document.head.appendChild(style);

        popup.innerHTML = `
            <div class="popup-header" style="padding: 12px 16px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600; display: flex; justify-content: space-between;">
                <span>🛠️ STATE</span>
                <div style="display:flex; gap:10px;">
                    <span style="cursor:pointer;" onclick="document.getElementById('dev-state-popup').classList.toggle('minimized')">_</span>
                    <span style="cursor:pointer;" onclick="document.getElementById('dev-state-popup').classList.add('hidden')">×</span>
                </div>
            </div>
            <div class="popup-body" style="padding: 16px;">
                <div class="row"><label>Check-in</label><span class="val" id="debug-checkin">--</span></div>
                <div class="row"><label>Check-out</label><span class="val" id="debug-checkout">--</span></div>
                <div class="row"><label>Status</label><span class="val" id="debug-status">Waiting</span></div>
                <button class="action" onclick="window.clearContext()">Reset Context</button>
            </div>
        `;

        document.body.appendChild(popup);

        let isDragging = false;
        popup.querySelector('.popup-header').onmousedown = (e) => {
            isDragging = true;
            let offsetX = e.clientX - popup.getBoundingClientRect().left;
            let offsetY = e.clientY - popup.getBoundingClientRect().top;
            document.onmousemove = (e) => {
                if (!isDragging) return;
                popup.style.left = (e.clientX - offsetX) + 'px';
                popup.style.top = (e.clientY - offsetY) + 'px';
                popup.style.bottom = 'auto';
            };
            document.onmouseup = () => isDragging = false;
        };
    }

    function updateDevPopup() {
        if (!document.getElementById('dev-state-popup')) injectDevPopup();
        const ctx = window.bookingContext || {};
        const elIn = document.getElementById('debug-checkin');
        const elOut = document.getElementById('debug-checkout');
        const elStatus = document.getElementById('debug-status');

        if (elIn) elIn.textContent = ctx.startDate || '--';
        if (elOut) elOut.textContent = ctx.endDate || '--';
        if (elStatus) {
            const isFull = ctx.startDate && ctx.endDate;
            elStatus.textContent = isFull ? '✅ Synced' : (ctx.startDate || ctx.endDate ? '⏳ Partial' : '✅ Cleared');
            elStatus.style.color = isFull ? '#4ade80' : '#94a3b8';
        }
    }

    // EXTRACTION ENGINE
    // -----------------
    function parseDate(dateStr) {
        if (!dateStr) return null;

        // If already in YYYY-MM-DD match, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        if (dateStr.includes('-') && !dateStr.includes(',')) {
            // Handle some hyphenated cases if they look like dates
            if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                const p = dateStr.split('-');
                return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
            }
        }

        if (dateStr.includes('Add')) return null;

        const cleanStr = dateStr.replace(/\s+/g, ' ').trim();
        // Updated regex to handle day first or month first more flexibly
        // Match "Jan 22, 2026" or "September 15, 2026"
        const match = cleanStr.match(/([A-Za-z]{3,})\s+(\d+)(?:,?\s+(\d{4}))?/) ||
            cleanStr.match(/(\d+)\s+([A-Za-z]{3,})(?:,?\s+(\d{4}))?/);

        if (match) {
            const monthMap = {
                'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
            };

            let mStr, dStr, yStr;
            if (isNaN(parseInt(match[1]))) {
                // Month Day Year
                mStr = match[1]; dStr = match[2]; yStr = match[3];
            } else {
                // Day Month Year
                dStr = match[1]; mStr = match[2]; yStr = match[3];
            }

            const monthName = mStr.toLowerCase().substring(0, 3);
            const m = monthMap[monthName];
            const d = dStr;
            const y = yStr || new Date().getFullYear();

            if (m && d) {
                return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            }
        }
        return null;
    }

    function extractDatesFromNode(rootNode) {
        const results = { start: null, end: null, shouldClear: false };

        // NEIGHBOR WALK: Search for labels and then their immediate siblings/neighbors
        const allNodes = Array.from(rootNode.querySelectorAll('*'));

        allNodes.forEach((node, idx) => {
            const text = node.innerText || node.textContent || "";

            // 1. Label Detection (Check-in / Check-out)
            const isCheckInLabel = /Check-in/i.test(text) && text.length < 15;
            const isCheckOutLabel = /Check-out/i.test(text) && text.length < 15;

            if (isCheckInLabel || isCheckOutLabel) {
                // Peek at next sibling or parent's other children
                // Often the date is in the NEXT div/span
                const searchNodes = [
                    node.nextElementSibling,
                    node.parentElement ? node.parentElement.nextElementSibling : null,
                    allNodes[idx + 1]
                ];

                searchNodes.forEach(s => {
                    if (!s) return;
                    const t = s.innerText || s.textContent || "";
                    if (t.includes('-') || t.includes('Add')) results.shouldClear = true;

                    const d = parseDate(t);
                    if (d) {
                        if (isCheckInLabel) results.start = d;
                        if (isCheckOutLabel) results.end = d;
                    }
                });
            }
        });

        // Combined string check as backup
        const rootText = rootNode.innerText || rootNode.textContent || "";
        if (/Check-in:\s*-/i.test(rootText) || /Check-out:\s*-/i.test(rootText)) {
            results.shouldClear = true;
        }

        return results;
    }

    function initExtractor() {
        const observer = new MutationObserver((mutations) => {
            let needsScan = false;
            mutations.forEach(m => {
                const targetText = (m.target.innerText || m.target.textContent || "");
                if (/Check-in|Check-out|Date/i.test(targetText)) {
                    needsScan = true;
                }
            });

            if (needsScan) {
                const widgets = document.querySelectorAll('[id^="hostaway-calendar-widget"]');
                widgets.forEach(widget => {
                    const data = extractDatesFromNode(widget);
                    if (data.shouldClear) {
                        window.clearContext();
                    } else {
                        if (data.start) updateBookingContext('startDate', data.start);
                        if (data.end) updateBookingContext('endDate', data.end);
                    }
                });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        console.log('🧬 EXTRACTION OBSERVER LIVE (NEIGHBOR WALK ENABLED)');
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            const p = document.getElementById('dev-state-popup');
            if (p) p.classList.toggle('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.innerText?.toLowerCase().includes('clear dates')) {
            window.clearContext();
        }
    }, true);


    // IFRAME SYNC BRIDGE
    // ------------------
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'hostaway-dates-updated') {
            console.log('📬 Iframe Sync Received:', event.data);
            if (event.data.checkIn) {
                const parsed = parseDate(event.data.checkIn);
                if (parsed) updateBookingContext('startDate', parsed);
                else updateBookingContext('startDate', event.data.checkIn); // Fallback
            }
            if (event.data.checkOut) {
                const parsed = parseDate(event.data.checkOut);
                if (parsed) updateBookingContext('endDate', parsed);
                else updateBookingContext('endDate', event.data.checkOut); // Fallback
            }
        }
        if (event.data?.type === 'hostaway-dates-cleared') {
            console.log('📬 Iframe Clear Received');
            window.clearContext();
        }
    });

    // SIM A: BRIDGE BUILDER (from hostaway-test.html)
    // ------------------------------------------------
    function findCell(dayNum, occurrences = 1) {
        const cells = Array.from(document.querySelectorAll('#hostaway-calendar-widget div[class*="Day"], .CalendarDay, td'));
        const matches = cells.filter(c => c.innerText.trim() === String(dayNum) && !c.className.includes('Outside'));
        return matches[occurrences - 1];
    }

    function waft(el) {
        if (!el) return;
        ['mouseenter', 'mouseover', 'mousemove', 'pointerenter', 'pointermove'].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });
    }

    window.findCell = findCell;
    window.waft = waft;

    function init() {
        deployB2Assassin();
        deployWatcher();
        initExtractor();
        injectDevPopup();
        updateDevPopup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

})();
