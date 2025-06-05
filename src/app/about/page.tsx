import { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて - UniProject ステータスサイト",
  description:
    "UniProjectのステータスサイトは、Datadogの監視システムと連携し、サービスの健全性を24時間365日リアルタイムで把握・共有します。",
  openGraph: {
    title: "このサイトについて - UniProject ステータスサイト",
    description:
      "UniProjectのステータスサイトは、Datadogの監視システムと連携し、サービスの健全性を24時間365日リアルタイムで把握・共有します。",
    url: "https://status.uniproject.jp/about",
    siteName: "UniProject ステータスサイト",
    images: {
      url: "https://status.uniproject.jp/og-image.png",
      alt: "UniProject ステータスサイト",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "このサイトについて - UniProject ステータスサイト",
    description:
      "UniProjectのステータスサイトは、Datadogの監視システムと連携し、サービスの健全性を24時間365日リアルタイムで把握・共有します。",
    creator: "@uniproject_jp",
    site: "@uniproject_jp",
  },
  themeColor: "#3b82f6",
};

export const dynamic = "force-static"; // 静的生成を強制

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            ステータスサイトについて
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Datadogの高度な監視システムと連携し、サービスの健全性を24時間365日リアルタイムで把握・共有しています。
          </p>
        </div>

        {/* 監視機能セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-xl font-semibold ml-3">高度なメトリクス監視</h3>
            </div>
            <p className="text-gray-600">
              Datadogによる包括的な監視システムで、レイテンシー、エラーレート、リソース使用率など、重要な指標をリアルタイムで追跡しています。
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="text-xl font-semibold ml-3">インテリジェントなアラート</h3>
            </div>
            <p className="text-gray-600">
              機械学習ベースの異常検知により、問題を早期に発見。アラートは自動的に優先順位付けされ、即座に対応できる体制を整えています。
            </p>
          </div>
        </div>

        {/* インシデント管理セクション */}
        <div className="bg-white p-8 rounded-xl shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">インシデント管理システム</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Datadogのインシデント管理システムを活用し、以下の情報をリアルタイムで提供しています：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>インシデントの検出時刻と解決時刻</li>
              <li>影響を受けたサービスの詳細</li>
              <li>インシデントの重要度レベル</li>
              <li>対応状況と進捗</li>
            </ul>
          </div>
        </div>

        {/* コミットメントセクション */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">私たちの約束</h2>
          <p className="text-gray-600 mb-4">
            Datadogの強力な監視プラットフォームを活用し、サービスの信頼性と透明性を最大限に高めています。
            問題が発生した際は、正確な情報をリアルタイムで提供し、迅速な解決に努めます。
          </p>
          <div className="flex items-center justify-center mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm font-medium">Professional Monitoring Platform</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
