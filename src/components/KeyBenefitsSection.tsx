import React from 'react';
import { TrendingDown, Zap, UserX, ShieldCheck, CheckCheck } from 'lucide-react';

export const KeyBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Reduced Downtime",
      stat: "99.4%",
      statLabel: "Downtime prevention rate",
      description: "Contain blast radiuses immediately. Rather than waiting for cascade failures to take down dependent services, AutoHeal isolates and resolves anomalies within seconds."
    },
    {
      icon: Zap,
      title: "Faster Recovery (MTTR)",
      stat: "< 4.2s",
      statLabel: "Average time to resolution",
      description: "Compress mean-time-to-recovery from 35–45 minutes down to sub-five seconds. Automated actuators take immediate deterministic action with no human latency."
    },
    {
      icon: UserX,
      title: "Less Manual Intervention",
      stat: "90%",
      statLabel: "Reduction in on-call pages",
      description: "Eliminate repetitive 3 AM pages for known ephemeral container crashes, memory saturation, and minor regressions. Engineers only get paged when human architecture decisions are required."
    },
    {
      icon: ShieldCheck,
      title: "Better Reliability",
      stat: "Zero",
      statLabel: "Unmonitored failure modes",
      description: "Equipped with continuous health heuristics, circuit breakers, and verification policies that prevent destructive restart flapping and ensure systematic stability."
    },
    {
      icon: CheckCheck,
      title: "Improved Service Availability",
      stat: "99.99%",
      statLabel: "Consistent production SLO",
      description: "Provide reliable customer experiences even during flash traffic spikes, AZ network degradation, or third-party downstream timeouts with automated load shifting and scaling."
    }
  ];

  return (
    <section id="benefits" className="py-24 border-b border-midnight-800 bg-midnight-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-400 uppercase tracking-wider mb-2">
            Engineering Outcomes
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Measurable resilience for serious cloud operations.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            AutoHeal transforms incident response from reactive fire-fighting into a silent, autonomous background control loop.
          </p>
        </div>

        {/* 5 Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            const isWide = idx === 3 || idx === 4;
            return (
              <div
                key={benefit.title}
                className={`p-7 rounded-xl bg-midnight-900/60 border border-midnight-800 hover:border-healblue-700/80 transition-all flex flex-col justify-between group ${
                  isWide ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-midnight-850 border border-midnight-750 flex items-center justify-center text-healblue-400 group-hover:border-healblue-500 transition-colors">
                      <Icon className="w-5 h-5 text-healblue-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-white tracking-tight">{benefit.stat}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{benefit.statLabel}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-2 tracking-tight">
                    {benefit.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-midnight-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Production Impact</span>
                  <span className="text-healblue-300">Continuous SLO</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
