'use client';

import BillGenerator from '@/components/BillGenerator';

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-6xl mx-auto">
				<div className="text-center py-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						Restaurant Bill Generator
					</h1>
					<p className="text-gray-600 text-lg">
						Generate professional restaurant bills with ease
					</p>
				</div>

				<BillGenerator />
			</div>
		</div>
	);
}
