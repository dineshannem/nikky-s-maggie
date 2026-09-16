import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Layers, 
  Key, 
  ShieldCheck, 
  Server, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  summary: string;
  category: 'Customer' | 'Orders' | 'Admin & Stock' | 'Analytics';
  description: string;
  requestBody?: object;
  responseSample: object;
}

export const ApiDocsView: React.FC = () => {
  const { menuItems, orders } = useApp();
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; latency: number; data: unknown } | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const endpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/menu',
      category: 'Customer',
      summary: 'Get full menu catalog with real-time stock',
      description: 'Returns all available dishes at Nikky Maggie House including live inventory portions, price in INR, and allergen/veg flags.',
      responseSample: {
        status: 'success',
        count: menuItems.length,
        data: menuItems.slice(0, 3).map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          price: m.price,
          stock: m.stock,
          isVeg: m.isVeg,
          preparationTime: m.preparationTime
        }))
      }
    },
    {
      method: 'POST',
      path: '/api/v1/orders/book',
      category: 'Orders',
      summary: 'Place Scan & Order with pickup token',
      description: 'Creates a new order session with Dine-In or Takeaway and assigns an instant pickup token number. Automatically validates inventory portions before confirmation.',
      requestBody: {
        customerName: 'Aarav Patel',
        customerPhone: '+91 98200 12345',
        bookingType: 'dine_in',
        timeSlot: '12:30 PM - 01:00 PM (Lunch)',
        items: [
          { menuItemId: 'mg-4', quantity: 2, spiceLevel: 'spicy' },
          { menuItemId: 'tc-1', quantity: 2 }
        ],
        notes: 'Extra masala please'
      },
      responseSample: {
        status: 'created',
        orderId: 'NMH-9412',
        tokenNumber: 'A-12',
        bookingType: 'dine_in',
        estimatedReadyMinutes: 15,
        paymentStatus: 'pending_checkout',
        totalAmount: 228
      }
    },
    {
      method: 'POST',
      path: '/api/v1/payments/checkout',
      category: 'Orders',
      summary: 'Process payment authorization (UPI QR / Cash)',
      description: 'Handles UPI QR redirection or cash-at-counter requests. Payment status must be confirmed by the payment provider or admin before settlement.',
      requestBody: {
        orderId: 'NMH-9412',
        paymentMethod: 'upi',
        upiApp: 'gpay',
        upiId: 'aarav@okaxis',
        amount: 228
      },
      responseSample: {
        status: 'paid',
        transactionId: 'UPI-TXN-849201',
        amount: 228,
        currency: 'INR',
        receiptUrl: 'https://nikkys-maggie.app/receipt/NMH-9412',
        authorizedAt: new Date().toISOString()
      }
    },
    {
      method: 'GET',
      path: '/api/v1/orders/:orderId/track',
      category: 'Orders',
      summary: 'Track live order preparation state & kitchen ETA',
      description: 'Polls or subscribes to real-time status progression ("new" -> "preparing" -> "ready" -> "completed").',
      responseSample: {
        orderId: 'NMH-1025',
        status: 'ready',
        statusMessage: 'Ready for Serving / Pickup Token!',
        queuePosition: 1,
        kitchenProgressPercent: 100,
        updatedAt: new Date().toISOString()
      }
    },
    {
      method: 'GET',
      path: '/api/v1/admin/analytics/kpis',
      category: 'Analytics',
      summary: 'Stakeholder telemetry, revenue & hourly trends',
      description: 'Returns real-time performance indicators including gross revenue, booking volumes, average ticket size, and category shares.',
      responseSample: {
        timeframe: 'today',
        totalGrossRevenue: orders.reduce((s, o) => s + o.payment.total, 0),
        totalOrdersCount: orders.length,
        averageOrderValue: 245,
        peakRushHour: '04 PM - 07 PM (Evening Maggie)',
        activeDinersCount: 14
      }
    },
    {
      method: 'PATCH',
      path: '/api/v1/admin/inventory/:itemId',
      category: 'Admin & Stock',
      summary: 'Real-time stock adjustment & price updates',
      description: 'Mutates stock portions in the live catalog with instant SSE broadcast to customer storefronts.',
      requestBody: {
        stockDelta: 10,
        newPrice: 75,
        inStock: true
      },
      responseSample: {
        status: 'updated',
        itemId: 'mg-1',
        name: 'Classic Veg Maggie',
        newStock: 25,
        inStock: true,
        synchronizedAt: new Date().toISOString()
      }
    }
  ];

  const currentEp = endpoints[selectedEndpointIndex];

  const generateCurl = () => {
    const baseUrl = 'https://api.nikkys-maggie.com';
    let curl = `curl -X ${currentEp.method} "${baseUrl}${currentEp.path}" \\\n  -H "Authorization: Bearer nmh_live_sec_8921f00" \\\n  -H "Content-Type: application/json"`;
    if (currentEp.requestBody) {
      curl += ` \\\n  -d '${JSON.stringify(currentEp.requestBody, null, 2)}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleRunInteractiveTest = () => {
    setIsRunningTest(true);
    setTestResult(null);

    // Simulate authentic API roundtrip latency (30ms - 80ms)
    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult({
        status: currentEp.method === 'POST' ? 201 : 200,
        latency: Math.floor(25 + Math.random() * 45),
        data: currentEp.responseSample
      });
    }, 450);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Developer API Documentation • Version 1.4</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-50">
          Nikky's Maggie House REST & Telemetry APIs
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Robust, scalable REST endpoints powering live item bookings, instant UPI payment verification, 
          real-time kitchen inventory telemetry, and stakeholder analytics dashboards.
        </p>

        <div className="pt-3 flex flex-wrap gap-4 text-xs text-neutral-300">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Bearer Token Authorization
          </span>
          <span className="flex items-center gap-1">
            <Server className="w-4 h-4 text-amber-400" />
            Base URL: <code className="font-mono text-[11px] bg-neutral-800 px-1.5 py-0.5 rounded">https://api.nikkys-maggie.com</code>
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-4 h-4 text-blue-400" />
            JSON Content-Type
          </span>
        </div>
      </div>

      {/* Explorer Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Endpoint Directory (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs p-3 space-y-1.5">
          <div className="p-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Available Endpoints
          </div>

          {endpoints.map((ep, idx) => {
            const isSelected = selectedEndpointIndex === idx;
            const methodColor = ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEndpointIndex(idx);
                  setTestResult(null);
                }}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-xs' 
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 border border-transparent'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold ${methodColor}`}>
                      {ep.method}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {ep.summary}
                    </span>
                  </div>
                  <code className="text-[10px] font-mono text-neutral-400 block truncate">
                    {ep.path}
                  </code>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-600 translate-x-1' : 'text-neutral-300'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Side: Interactive Console & Test Runner (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs p-6 space-y-6">
          
          {/* Active Endpoint Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                  {currentEp.method}
                </span>
                <code className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {currentEp.path}
                </code>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {currentEp.description}
              </p>
            </div>

            <button
              onClick={handleRunInteractiveTest}
              disabled={isRunningTest}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunningTest ? 'Sending Request...' : 'Test Endpoint'}</span>
            </button>
          </div>

          {/* cURL Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                cURL Request Command
              </span>
              <button
                onClick={handleCopyCurl}
                className="text-xs text-neutral-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied to Clipboard' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
              <code>{generateCurl()}</code>
            </pre>
          </div>

          {/* Request Body (if any) */}
          {currentEp.requestBody && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                JSON Request Payload
              </span>
              <pre className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
                <code>{JSON.stringify(currentEp.requestBody, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Response Payload / Live Test Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {testResult ? 'Live Test Response Output' : 'Sample Response Schema'}
              </span>
              {testResult && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    HTTP {testResult.status} OK
                  </span>
                  <span className="text-neutral-400 font-mono">
                    {testResult.latency} ms
                  </span>
                </div>
              )}
            </div>

            <pre className={`p-4 rounded-2xl font-mono text-xs overflow-x-auto border transition-all ${
              testResult 
                ? 'bg-neutral-900 text-emerald-400 border-emerald-500/50 shadow-md' 
                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
            }`}>
              <code>{JSON.stringify(testResult ? testResult.data : currentEp.responseSample, null, 2)}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
