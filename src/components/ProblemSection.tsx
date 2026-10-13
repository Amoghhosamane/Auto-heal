import React from 'react';
import { AlertCircle, Cpu, GitPullRequestClosed, Clock } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "Sudden Pod Crashes & OOM",
      description: "Unhandled memory leaks and deadlocks cause silent 502 errors before alerts trigger.",
      impact: "Silent user-facing downtime"
    },
    {
      icon: Cpu,
      title: "Resource Saturation",
      description: "Traffic spikes exhaust node CPU and memory, causing cascading queue timeouts.",
      impact: "p99 latency spikes >10s"
    },
    {
      icon: GitPullRequestClosed,
      title: "Faulty Deployments",
      description: "Broken releases introduce regression and schema errors into production workloads.",
      impact: "Canary failure & failed rollouts"
    },
    {
      icon: Clock,
      title: "Slow Manual Triage",
      description: "Manual on-call alerting and diagnosis takes 30–45 minutes per incident on average.",
      impact: "High MTTR and engineer fatigue"
    }
  ];

  return (
    <section id="problem" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            The Problem
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Manual triage is too slow for modern scale.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            When microservices fail at runtime, human reaction times are inherently too slow to prevent service degradation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-white dark:bg-midnight-900/60 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 dark:hover:border-healblue-800 transition-colors flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-midnight-750 flex items-center justify-center group-hover:border-healblue-400 dark:group-hover:border-healblue-600 transition-colors">
                      <Icon className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-midnight-800/80 text-[11px] font-mono text-healblue-700 dark:text-healblue-300">
                  {item.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
