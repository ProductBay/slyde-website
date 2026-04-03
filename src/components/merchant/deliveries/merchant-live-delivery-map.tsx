type TrackingPoint = {
  lat: number;
  lng: number;
  label: string;
};

type MerchantLiveDeliveryMapProps = {
  rider?: TrackingPoint;
  pickup?: TrackingPoint;
  destination?: TrackingPoint;
  etaToPickupMinutes?: number;
  etaToDeliveryMinutes?: number;
  lastUpdatedAt?: string;
  statusLabel: string;
};

function formatEta(minutes?: number, fallback = "Pending") {
  if (minutes === undefined) return fallback;
  if (minutes <= 1) return "About 1 min";
  if (minutes < 60) return `About ${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function toViewport(points: TrackingPoint[]) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = maxLat - minLat || 0.02;
  const lngRange = maxLng - minLng || 0.02;

  return points.map((point) => ({
    ...point,
    x: 10 + ((point.lng - minLng) / lngRange) * 80,
    y: 12 + ((maxLat - point.lat) / latRange) * 70,
  }));
}

export function MerchantLiveDeliveryMap({
  rider,
  pickup,
  destination,
  etaToPickupMinutes,
  etaToDeliveryMinutes,
  lastUpdatedAt,
  statusLabel,
}: MerchantLiveDeliveryMapProps) {
  const points = [pickup, rider, destination].filter((item): item is TrackingPoint => Boolean(item));
  const viewport = points.length >= 2 ? toViewport(points) : [];
  const pickupPoint = viewport.find((point) => point.label === pickup?.label);
  const riderPoint = viewport.find((point) => point.label === rider?.label);
  const destinationPoint = viewport.find((point) => point.label === destination?.label);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Live dispatch map</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Assigned Slyder location and live ETAs</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {statusLabel}. Merchants can track the rider toward pickup and delivery from one workspace view.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {lastUpdatedAt ? `Updated ${new Date(lastUpdatedAt).toLocaleTimeString("en-JM", { hour: "numeric", minute: "2-digit" })}` : "Waiting on location feed"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ETA to pickup</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatEta(etaToPickupMinutes)}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ETA to delivery</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatEta(etaToDeliveryMinutes)}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tracking state</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{rider ? "Live location visible" : "ETA only"}</p>
        </div>
      </div>

      {viewport.length >= 2 ? (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
          <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Relative route view
          </div>
          <div className="p-4">
            <svg viewBox="0 0 100 84" className="h-[18rem] w-full rounded-[1.25rem] bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_100%)]">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100" height="84" fill="url(#grid)" />
              {pickupPoint && riderPoint ? (
                <line x1={pickupPoint.x} y1={pickupPoint.y} x2={riderPoint.x} y2={riderPoint.y} stroke="#0f172a" strokeDasharray="2 2" strokeWidth="0.8" />
              ) : null}
              {riderPoint && destinationPoint ? (
                <line x1={riderPoint.x} y1={riderPoint.y} x2={destinationPoint.x} y2={destinationPoint.y} stroke="#0284c7" strokeWidth="1.2" />
              ) : null}
              {viewport.map((point) => {
                const tone =
                  point.label === rider?.label
                    ? { fill: "#0f172a", stroke: "#ffffff" }
                    : point.label === pickup?.label
                      ? { fill: "#16a34a", stroke: "#ffffff" }
                      : { fill: "#0284c7", stroke: "#ffffff" };

                return (
                  <g key={`${point.label}-${point.lat}-${point.lng}`}>
                    <circle cx={point.x} cy={point.y} r="3.2" fill={tone.fill} stroke={tone.stroke} strokeWidth="1.2" />
                    <text x={point.x + 4.2} y={point.y - 4} fontSize="3.4" fill="#0f172a" fontWeight="600">
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
          Live map updates appear here once the assigned Slyder shares route coordinates through the dispatch event feed. ETA cards can still update before the map feed is available.
        </div>
      )}
    </div>
  );
}
