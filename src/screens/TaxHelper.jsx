// TaxHelper.jsx

export default function TaxHelper({ user }) {
  const bizType = user?.user_metadata?.bizType || "other"

  const tips = [
    { icon: "🧾", title: "Keep All Receipts", desc: "Save every receipt for purchases above GHS 50. Use the BizBuddy tracker to record them digitally." },
    { icon: "📊", title: "Record Daily Sales", desc: "Ghana Revenue Authority (GRA) requires businesses to maintain records of all sales. Use the Tracker daily." },
    { icon: "📅", title: "File Quarterly", desc: "Most small businesses in Ghana need to file tax returns quarterly. Download your BizBuddy monthly reports as evidence." },
    { icon: "🏦", title: "Separate Accounts", desc: "Open a separate mobile money account for your business. Mixing personal and business money makes tax filing harder." },
    { icon: "📋", title: "Register Your Business", desc: "Register with the Registrar General's Department. It costs GHS 60–150 and gives you legal protection and access to loans." },
    { icon: "💡", title: "VAT Threshold", desc: "If your annual turnover exceeds GHS 200,000, you must register for VAT with GRA. Below this, you're exempt." },
    { icon: "👥", title: "Staff Records", desc: "If you have employees, you must register for PAYE and contribute to SSNIT. Even for casual workers." },
  ]

  const bizSpecific = {
    food: ["Keep health certificate records", "Log all ingredient purchases — these are deductible expenses", "Record daily sales separately from catering income"],
    seamstress: ["Log fabric and thread purchases as cost of goods", "Track advance payments (deposits) separately from completed payments", "Keep client order records for 5 years"],
    beauty: ["Product purchases are deductible business expenses", "Log all service income daily", "If you rent a space, the rent is tax deductible"],
    trader: ["Stock purchases are cost of goods — keep all supplier receipts", "Market levy payments can be documented as business expenses", "Track slow and peak seasons for tax planning"],
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Tax & Compliance</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Simple guidance to keep your business organised</p>

      <div className="bg-primary dark:bg-[#112221] border border-transparent dark:border-[#1A3A38] rounded-2xl p-4 mb-4">
        <p className="text-white/70 dark:text-gray-400 text-xs mb-1">Important note</p>
        <p className="text-white dark:text-gray-200 text-sm">This is general guidance only. For specific tax advice, consult a licensed accountant or the Ghana Revenue Authority (GRA) at 0800-900-110.</p>
      </div>

      {bizType && bizSpecific[bizType] && (
        <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
          <p className="font-semibold text-gray-800 dark:text-white mb-3">
            Tips for {bizType === "seamstress" ? "Seamstresses" : bizType === "food" ? "Food Vendors" : bizType === "beauty" ? "Beauty Professionals" : "Market Traders"}
          </p>
          {bizSpecific[bizType].map((tip, i) => (
            <div key={i} className="flex gap-2 py-2 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
              <span className="text-primary dark:text-[#2DD4BF] font-bold text-sm">✓</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">{tip}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
            <div className="flex gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{tip.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{tip.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mt-4">
        <p className="font-semibold text-gray-800 dark:text-white mb-3">Useful Contacts</p>
        {[
          { name: "Ghana Revenue Authority", phone: "0800-900-110", desc: "Tax registration and filing" },
          { name: "Registrar General's Dept", phone: "0302-664-691", desc: "Business registration" },
          { name: "SSNIT", phone: "0302-611-100", desc: "Social security for staff" },
        ].map(c => (
          <div key={c.name} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
            <div>
              <p className="text-sm font-medium dark:text-white">{c.name}</p>
              <p className="text-xs text-gray-400">{c.desc}</p>
            </div>
            <a href={`tel:${c.phone}`} className="text-xs bg-primary/10 dark:bg-[#1A3A38] text-primary dark:text-[#2DD4BF] px-3 py-1.5 rounded-xl font-medium">
              📞 Call
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}