import React from 'react';
import { Award, CheckCircle2, AlertOctagon, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils.js';

export default function ImpactScreen({
  impactMetrics,
  activities = [],
  currencySymbol = '₹'
}) {
  return (
    <div className="space-y-7 pb-20 md:pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">Verified Food-Saving Impact</h1>
        <p className="text-secondary-text text-sm sm:text-base mt-1">
          Actual records from your fridge. Zero speculative numbers or artificial statistics.
        </p>
      </div>

      {/* Honest Methodology Banner */}
      <div className="p-4 bg-white rounded-2xl border border-sage shadow-card text-xs text-forest flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          FridgeWise AI tracks verified user consumption and reported discards. Value estimates are computed strictly from grocery purchase prices you provide.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-subtle-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-mint text-forest flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-apricot" />
          </div>
          <div>
            <span className="text-2xl font-black text-forest">
              {impactMetrics.itemsRescuedBeforeDeadline || 0}
            </span>
            <span className="text-secondary-text text-xs ml-1 font-medium">items</span>
          </div>
          <h3 className="text-xs font-bold text-forest">Rescued Before Deadline</h3>
          <p className="text-[11px] text-secondary-text">
            {impactMetrics.weeklyRescuedCount || 0} rescued in the last 7 days
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-subtle-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-mint text-forest flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-primary-green" />
          </div>
          <div>
            <span className="text-2xl font-black text-forest">
              {impactMetrics.totalConsumedEvents || 0}
            </span>
            <span className="text-secondary-text text-xs ml-1 font-medium">portions</span>
          </div>
          <h3 className="text-xs font-bold text-forest">Confirmed Consumption</h3>
          <p className="text-[11px] text-secondary-text">
            {impactMetrics.weeklyConsumedCount || 0} portions eaten this week
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-subtle-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-mint text-forest flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-forest" />
          </div>
          <div>
            <span className="text-2xl font-black text-forest">
              {impactMetrics.hasPriceData ? `${currencySymbol}${impactMetrics.totalValueRescued}` : '—'}
            </span>
          </div>
          <h3 className="text-xs font-bold text-forest">Grocery Value Rescued</h3>
          <p className="text-[11px] text-secondary-text">
            {impactMetrics.hasPriceData ? 'Sum of entered item costs saved' : 'Add purchase prices to track monetary savings'}
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-subtle-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-red-50 text-error-red flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-black text-forest">
              {impactMetrics.totalDiscardedEvents || 0}
            </span>
            <span className="text-secondary-text text-xs ml-1 font-medium">discards</span>
          </div>
          <h3 className="text-xs font-bold text-forest">Reported Discards</h3>
          <p className="text-[11px] text-secondary-text">
            Spot grocery over-buying trends
          </p>
        </div>
      </div>

      {/* Discard Breakdown */}
      {impactMetrics.totalDiscardedEvents > 0 && Object.keys(impactMetrics.discardReasons).length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-subtle-border shadow-card space-y-3">
          <h3 className="font-bold text-forest text-sm">Disposal Reasons Logged</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {Object.entries(impactMetrics.discardReasons).map(([reason, count]) => (
              <div key={reason} className="p-3 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between text-xs">
                <span className="text-main-text font-medium">{reason}</span>
                <span className="font-bold text-error-red">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-subtle-border shadow-card space-y-4">
        <h3 className="font-bold text-forest text-base">Activity Timeline</h3>

        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-secondary-text">
            No activities recorded yet. When you cook recipes or mark items used, your timeline will appear here.
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-subtle-border">
            {activities.map((act) => {
              const isConsumed = act.type === 'consumed' || act.type === 'partially_consumed';

              return (
                <div key={act.id} className="pt-3.5 first:pt-0 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isConsumed ? 'bg-mint text-forest' : 'bg-red-50 text-error-red'
                    }`}>
                      {isConsumed ? <CheckCircle2 className="w-4 h-4 text-primary-green" /> : <AlertOctagon className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="font-bold text-forest text-sm">
                        {act.itemName}
                      </h4>
                      <p className="text-secondary-text mt-0.5">
                        {isConsumed ? (
                          <>
                            {act.type === 'partially_consumed' ? 'Partially used' : 'Consumed'}{' '}
                            <strong>{act.quantityUsed} {act.unit}</strong>
                            {act.value ? ` • Estimated value saved: ${currencySymbol}${act.value}` : ''}
                          </>
                        ) : (
                          <>
                            Discarded • Reason: <em>{act.reason || 'Unspecified'}</em>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-secondary-text shrink-0">
                    {act.timestamp ? formatDisplayDate(act.timestamp) : 'Recent'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
