'use client';

import { KeyboardEvent, useState } from 'react';
import { INITIAL_OBSTACLE, MOCK_PARKING_LOTS, MOCK_ROUTES } from '../data/mockNavigationData';

type RouteId = 'A' | 'B' | 'C';

export default function AccessibilityNavigationPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<RouteId>('C');
  const [isObstacleModalOpen, setIsObstacleModalOpen] = useState(false);
  const [isReroutingLoading, setIsReroutingLoading] = useState(false);
  const [showRouteSelection, setShowRouteSelection] = useState(false);
  const [isNoAccessibleRouteMode, setIsNoAccessibleRouteMode] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);

  const activeRoute = MOCK_ROUTES.find((route) => route.id === selectedRouteId) ?? MOCK_ROUTES[2];
  const resetFlow = () => {
    setSelectedRouteId('C');
    setShowRouteSelection(false);
    setIsObstacleModalOpen(false);
    setIsReroutingLoading(false);
    setShowParkingModal(false);
  };
  const handleAvoidObstacle = () => {
    setIsObstacleModalOpen(false);
    setIsReroutingLoading(true);
    window.setTimeout(() => {
      setIsReroutingLoading(false);
      setShowRouteSelection(true);
      if (!isNoAccessibleRouteMode) setSelectedRouteId('A');
    }, 900);
  };
  const handleMarkerKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsObstacleModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-slate-950 font-sans text-slate-100">
      <main className="relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-slate-900 shadow-2xl">
        <header className="absolute inset-x-0 top-0 z-20 border-b border-slate-700/60 bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
              <h1 className="truncate text-sm font-bold">이동약자 접근성 내비게이션</h1>
            </div>
            <button type="button" onClick={() => { setIsNoAccessibleRouteMode((value) => !value); resetFlow(); }} className="shrink-0 rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-[10px]">
              {isNoAccessibleRouteMode ? '예외 모드' : '정상 모드'}
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="truncate"><span className="text-slate-500">출발 </span>청일조계지</div>
            <span className="text-slate-600">→</span>
            <div className="truncate font-semibold text-emerald-400"><span className="font-normal text-slate-500">도착 </span>자유공원</div>
          </div>
        </header>

        <section className="relative flex-1 overflow-hidden bg-slate-950" aria-label="이동 경로 지도">
          <svg className="h-full w-full select-none" viewBox="0 0 400 420" role="img" aria-label="청일조계지에서 자유공원까지의 접근성 경로">
            <rect width="400" height="420" fill="#090d16" />
            <path d="M20 45 Q180 60 380 30 L380 390 Q200 410 20 370Z" fill="#0f172a" opacity="0.7" />
            <ellipse cx="200" cy="115" rx="140" ry="65" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            {MOCK_ROUTES.filter((route) => showRouteSelection || route.id === 'C').map((route) => {
              const selected = route.id === selectedRouteId && !isNoAccessibleRouteMode;
              const color = route.id === 'A' ? '#10b981' : route.id === 'B' ? '#f59e0b' : '#ef4444';
              return <path key={route.id} d={route.pathCoordinates} fill="none" stroke={selected ? color : '#475569'} strokeWidth={selected ? 6 : 3} strokeDasharray={route.id === 'C' ? '7 5' : undefined} strokeLinecap="round" opacity={showRouteSelection && !selected ? 0.45 : 1} className="transition-all duration-300" />;
            })}
            <g transform="translate(180,340)"><circle r="10" fill="#3b82f6" stroke="#fff" strokeWidth="2" /><circle r="3" fill="#fff" /><text x="15" y="4" fill="#bfdbfe" fontSize="11" fontWeight="bold">청일조계지</text></g>
            <g transform="translate(220,80)"><circle r="15" fill="#10b981" opacity="0.25" /><circle r="10" fill="#10b981" stroke="#fff" strokeWidth="2" /><text x="16" y="4" fill="#6ee7b7" fontSize="12" fontWeight="bold">자유공원</text></g>
            {!showRouteSelection && (
              <g transform={`translate(${INITIAL_OBSTACLE.x},${INITIAL_OBSTACLE.y})`} className="cursor-pointer outline-none" role="button" tabIndex={0} aria-label="계단 장애물 상세 보기" onClick={() => setIsObstacleModalOpen(true)} onKeyDown={handleMarkerKeyDown}>
                <circle r="26" fill="#ef4444" fillOpacity="0.18" className="animate-pulse" /><circle r="15" fill="#ef4444" stroke="#fff" strokeWidth="2" /><text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900">!</text><rect x="-36" y="-37" width="72" height="20" rx="5" fill="#1e293b" stroke="#ef4444" /><text x="0" y="-23" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="bold">계단 주의</text>
              </g>
            )}
          </svg>
          <div className="pointer-events-none absolute left-4 right-4 top-24"><span className="inline-block rounded-full border border-slate-700 bg-slate-950/85 px-3 py-1.5 text-xs shadow-lg">{showRouteSelection ? isNoAccessibleRouteMode ? '⚠ 접근 가능한 보행로 없음' : `선택 경로: ${activeRoute.name}` : '⚠ 빨간 계단 마커를 눌러보세요'}</span></div>
        </section>

        {isReroutingLoading && <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center backdrop-blur-sm" role="status"><div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" /><p className="font-bold">접근 가능한 다른 경로를 확인하고 있습니다…</p><p className="mt-1 text-xs text-slate-400">계단, 경사, 턱, 보행 공간을 확인 중입니다.</p></div>}

        {showRouteSelection && !isReroutingLoading && (
          <section className="no-scrollbar z-30 max-h-[50vh] overflow-y-auto border-t border-slate-700 bg-slate-900 p-4 shadow-2xl" aria-label="대체 경로 선택">
            {isNoAccessibleRouteMode ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-4"><h2 className="text-sm font-bold text-amber-300">⚠ 완전한 무계단 경로를 찾지 못했습니다.</h2><p className="mt-2 text-xs leading-relaxed text-slate-300">확인된 보행 경로에 계단 또는 보차 미분리 위험 구간이 포함되어 있습니다.</p><button type="button" onClick={() => setShowParkingModal(true)} className="mt-4 w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950">🚗 접근 가능한 진입 지점 보기</button></div>
            ) : (
              <><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">접근성 경로 비교</h2><span className="text-[11px] text-emerald-400">안전도 높은 순</span></div><div className="flex flex-col gap-2">
                {MOCK_ROUTES.map((route) => {
                  const selected = route.id === selectedRouteId;
                  return <button type="button" key={route.id} onClick={() => setSelectedRouteId(route.id)} aria-pressed={selected} className={`w-full rounded-xl border p-3 text-left transition-all ${selected ? 'border-emerald-500 bg-slate-800 ring-1 ring-emerald-500/40' : 'border-slate-800 bg-slate-950/40'}`}>
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-sm font-bold">경로 {route.id} <span className="font-normal text-slate-300">· {route.name}</span></div><div className="mt-1 text-xs text-slate-400">예상 <strong className="text-white">{route.time}분</strong> · {route.distance}m</div></div><div className={`shrink-0 text-lg font-black ${route.score >= 80 ? 'text-emerald-400' : route.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{route.score}점</div></div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-700/50 pt-2 text-[11px]"><span className={route.stairs ? 'font-bold text-rose-400' : 'text-emerald-400'}>{route.stairs ? '✕ 계단 있음' : '✓ 계단 없음'}</span><span className={route.steepSlope ? 'font-bold text-amber-400' : 'text-emerald-400'}>{route.steepSlope ? '⚠ 급경사' : '✓ 완만한 경사'}</span><span className={route.narrowSidewalk ? 'text-rose-400' : 'text-emerald-400'}>{route.narrowSidewalk ? '✕ 좁은 보도' : '✓ 보행 공간 확보'}</span></div>
                    <div className="mt-2 flex items-center justify-between text-[11px]"><span className={route.recommended ? 'font-bold text-emerald-300' : route.score >= 60 ? 'font-bold text-amber-300' : 'font-bold text-rose-300'}>{route.statusLabel}</span>{selected && <span className="font-bold text-emerald-400">선택됨 ✓</span>}</div>
                  </button>;
                })}
              </div></>
            )}
          </section>
        )}

        {isObstacleModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="obstacle-title"><div className="w-full rounded-t-2xl border-t border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between"><span className="rounded border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300">⚠ 이동 주의 구간</span><button type="button" onClick={() => setIsObstacleModalOpen(false)} className="min-h-11 min-w-11 text-slate-300" aria-label="닫기">✕</button></div>
            <h2 id="obstacle-title" className="mt-2 font-bold">{INITIAL_OBSTACLE.title}</h2><p className="mt-0.5 text-xs text-slate-400">{INITIAL_OBSTACLE.locationName}</p>
            <div className="relative mt-3 h-36 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={INITIAL_OBSTACLE.imageUrl} alt="청일조계지 계단 현장" className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded bg-slate-950/85 px-2 py-1 text-[10px]">현장 조사 사진</span></div>
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs leading-relaxed text-rose-100"><strong className="block">앞쪽에 계단이 있습니다.</strong>{INITIAL_OBSTACLE.detail}</div>
            <div className="mt-4 flex gap-2"><button type="button" onClick={() => setIsObstacleModalOpen(false)} className="min-h-12 flex-1 rounded-xl border border-slate-700 text-xs font-semibold">그대로 보기</button><button type="button" onClick={handleAvoidObstacle} className="min-h-12 flex-[2] rounded-xl bg-emerald-500 text-xs font-bold text-slate-950">피해가기 · 무계단 탐색</button></div>
          </div></div>
        )}

        {showParkingModal && (
          <div className="absolute inset-0 z-50 flex items-end bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="parking-title"><div className="no-scrollbar max-h-[82vh] w-full overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><h2 id="parking-title" className="font-bold">접근 가능한 주차장 / 하차 지점</h2><p className="mt-1 text-xs text-slate-400">주차 후 실제 진입 가능성을 기준으로 비교합니다.</p></div><button type="button" onClick={() => setShowParkingModal(false)} className="min-h-11 min-w-11" aria-label="닫기">✕</button></div>
            <div className="mt-3 flex flex-col gap-2.5">{MOCK_PARKING_LOTS.map((parking) => <article key={parking.id} className={`rounded-xl border p-3 ${parking.recommended ? 'border-emerald-500 bg-slate-800' : 'border-slate-700 bg-slate-950/40'}`}><div className="flex justify-between gap-3"><div><h3 className="text-sm font-bold">{parking.name}</h3><p className="mt-1 text-xs text-slate-400">자유공원까지 {parking.distance}m</p></div><div className={`shrink-0 text-lg font-black ${parking.accessibleScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{parking.accessibleScore}점</div></div><div className="mt-2 border-t border-slate-700/50 pt-2 text-[11px]"><p className={parking.hasStairsToDest ? 'font-bold text-rose-400' : 'text-emerald-400'}>{parking.hasStairsToDest ? '✕ 공원 진입로에 계단 존재' : '✓ 계단 없는 진입로'}</p><p className="mt-1 text-slate-300">{parking.description}</p></div>{parking.recommended && <span className="mt-2 inline-block rounded bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300">추천 진입 지점</span>}</article>)}</div>
            <button type="button" onClick={() => setShowParkingModal(false)} className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold">닫기</button>
          </div></div>
        )}
      </main>
    </div>
  );
}
