import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Database, Users, Calendar, Activity } from 'lucide-react';
import { DataSource, DataTable } from '../types';

interface DashboardProps {
  dataSources: DataSource[];
  dataTables: DataTable[];
}

const Dashboard: React.FC<DashboardProps> = ({ dataSources, dataTables }) => {
  const stats = useMemo(() => {
    const totalSources = dataSources.length;
    const activeSources = dataSources.filter(ds => ds.status === 'active').length;
    const totalTables = dataTables.length;
    const sensitiveTables = dataTables.filter(dt => dt.sensitive).length;
    const totalRecords = dataSources.reduce((sum, ds) => sum + (ds.recordCount || 0), 0);
    
    const departmentCounts = dataSources.reduce((acc, ds) => {
      acc[ds.department] = (acc[ds.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = dataSources.reduce((acc, ds) => {
      acc[ds.type] = (acc[ds.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSources,
      activeSources,
      totalTables,
      sensitiveTables,
      totalRecords,
      departmentCounts,
      typeCounts
    };
  }, [dataSources, dataTables]);

  const recentActivity = useMemo(() => {
    return dataTables
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 5);
  }, [dataTables]);

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Executive Dashboard</h1>
                <p className="text-blue-200 text-lg">Enterprise Data Intelligence Platform</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">{stats.totalSources}</div>
                <div className="text-blue-200 text-sm">Data Sources</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">{stats.activeSources}</div>
                <div className="text-blue-200 text-sm">Active Sources</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">{stats.totalTables}</div>
                <div className="text-blue-200 text-sm">Total Tables</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">{(stats.totalRecords / 1000000).toFixed(1)}M</div>
                <div className="text-blue-200 text-sm">Total Records</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Data Sources</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalSources}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <p className="text-sm text-emerald-600 font-medium">
                  {stats.activeSources} active
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Data Tables</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalTables}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm text-amber-600 font-medium">
                  {stats.sensitiveTables} contain PII
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Records</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {stats.totalRecords.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-purple-600 font-medium">
                  Enterprise scale
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Departments</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {Object.keys(stats.departmentCounts).length}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <p className="text-sm text-indigo-600 font-medium">
                  Connected
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sources by Department</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.departmentCounts).map(([department, count], index) => {
              const colors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-purple-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-red-500 to-rose-600'];
              const color = colors[index % colors.length];
              return (
                <div key={department} className="group hover:bg-slate-50 rounded-xl p-3 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{department}</span>
                    <span className="text-sm font-semibold text-slate-600">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                      style={{ width: `${(count / stats.totalSources) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Types */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sources by Type</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.typeCounts).map(([type, count], index) => {
              const colors = ['from-emerald-500 to-teal-600', 'from-purple-500 to-pink-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600'];
              const color = colors[index % colors.length];
              return (
                <div key={type} className="group hover:bg-slate-50 rounded-xl p-3 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700 capitalize">{type}</span>
                    <span className="text-sm font-semibold text-slate-600">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                      style={{ width: `${(count / stats.totalSources) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Recent Data Activity</h3>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 uppercase tracking-wide">Table</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 uppercase tracking-wide">Schema</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 uppercase tracking-wide">Last Accessed</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600 uppercase tracking-wide">Access Count</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-slate-600 uppercase tracking-wide">Sensitive</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {recentActivity.map((table, index) => (
                <tr key={table.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                      <span className="text-slate-900 font-semibold">{table.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{table.schema}</td>
                  <td className="py-4 px-6 text-slate-600">
                    {new Date(table.lastAccessed).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-right font-semibold">{table.accessCount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-center">
                    {table.sensitive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                        PII
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                        Safe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;