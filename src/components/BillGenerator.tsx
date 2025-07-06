'use client';

import { useState, useEffect } from 'react';
import {
	Download,
	Receipt,
	Calendar,
	Building2,
	Edit3,
	Plus,
	Trash2,
} from 'lucide-react';

interface BillItem {
	name: string;
	quantity: number;
	rate: number;
	amount: number;
}

interface BillData {
	billNo: number;
	date: string;
	time: string;
	items: BillItem[];
	subTotal: number;
	grossAmount: number;
	kotNo: string;
}

interface FormData {
	restaurantName: string;
	address: string;
	phone: string;
	startDate: string;
	endDate: string;
	billsPerDay: number;
	timeStart: number;
	timeEnd: number;
	items: BillItem[];
}

export default function BillGenerator() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCount, setGeneratedCount] = useState(0);
	const [showForm, setShowForm] = useState(false);
	const [previewTime, setPreviewTime] = useState('07:30'); // Static time for preview

	const [formData, setFormData] = useState<FormData>({
		restaurantName: 'ANNAI MESS',
		address: 'Iyyapanthangal, Chennai - 600056',
		phone: '9875921232',
		startDate: '2025-06-01',
		endDate: '2025-06-30',
		billsPerDay: 1,
		timeStart: 6,
		timeEnd: 10,
		items: [{ name: 'VEG MEALS', quantity: 1, rate: 160, amount: 160 }],
	});

	// Set a random time for preview on client side only
	useEffect(() => {
		const hour = Math.floor(Math.random() * (10 - 6 + 1)) + 6;
		const minute = Math.floor(Math.random() * 60);
		const pad = (n: number) => (n < 10 ? '0' + n : n);
		setPreviewTime(`${pad(hour)}:${pad(minute)}`);
	}, []);

	const pad = (n: number) => (n < 10 ? '0' + n : n);

	const addItem = () => {
		setFormData((prev) => ({
			...prev,
			items: [
				...prev.items,
				{ name: '', quantity: 1, rate: 0, amount: 0 },
			],
		}));
	};

	const removeItem = (index: number) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.filter((_, i) => i !== index),
		}));
	};

	const updateItem = (
		index: number,
		field: keyof BillItem,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.map((item, i) => {
				if (i === index) {
					const updatedItem = { ...item, [field]: value };
					if (field === 'quantity' || field === 'rate') {
						updatedItem.amount =
							updatedItem.quantity * updatedItem.rate;
					}
					return updatedItem;
				}
				return item;
			}),
		}));
	};

	const calculateDateRange = () => {
		const start = new Date(formData.startDate);
		const end = new Date(formData.endDate);
		const diffTime = Math.abs(end.getTime() - start.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		return diffDays;
	};

	const getRandomTime = () => {
		const hour =
			Math.floor(
				Math.random() * (formData.timeEnd - formData.timeStart + 1)
			) + formData.timeStart;
		const minute = Math.floor(Math.random() * 60);
		return `${pad(hour)}:${pad(minute)}`;
	};

	const calculateTotals = () => {
		const subTotal = formData.items.reduce(
			(sum, item) => sum + item.amount,
			0
		);
		return { subTotal, grossAmount: subTotal };
	};

	const generateBills = async () => {
		setIsGenerating(true);
		setGeneratedCount(0);

		try {
			// Dynamic import for jsPDF
			const jsPDF = (await import('jspdf')).default;

			let count = 0;
			const dateRange = calculateDateRange();
			const { subTotal, grossAmount } = calculateTotals();

			for (let day = 0; day < dateRange; day++) {
				const currentDate = new Date(formData.startDate);
				currentDate.setDate(currentDate.getDate() + day);
				const dateStr = `${pad(currentDate.getDate())}/${pad(
					currentDate.getMonth() + 1
				)}/${currentDate.getFullYear()}`;

				for (let bill = 1; bill <= formData.billsPerDay; bill++) {
					const billNo = 1000 + (day + 1) * 10 + bill;
					const time = getRandomTime();
					const tableNo = Math.floor(Math.random() * 100) + 1; // Random table number 1-100

					const doc = new jsPDF({
						unit: 'pt',
						format: [350, 500],
					});

					// Define column positions to match preview grid-cols-[2fr_1fr_1fr_1fr]
					const pageWidth = 350;
					const margin = 20;
					const contentWidth = pageWidth - 2 * margin;
					const col1Width = contentWidth * 0.5; // 2fr = 50%
					const col2Width = contentWidth * 0.167; // 1fr = 16.67%
					const col3Width = contentWidth * 0.167; // 1fr = 16.67%
					const col4Width = contentWidth * 0.167; // 1fr = 16.67%

					const col1X = margin;
					const col2X = col1X + col1Width;
					const col3X = col2X + col2Width;
					const col4X = col3X + col3Width;

					// Add content to PDF
					doc.setFont('helvetica', 'bold');
					doc.setFontSize(14);
					doc.text(formData.restaurantName, 175, 30, {
						align: 'center',
					});

					doc.setFont('helvetica', 'normal');
					doc.setFontSize(12);
					doc.text(formData.address, 175, 50, { align: 'center' });
					doc.text(`PH:${formData.phone}`, 175, 70, {
						align: 'center',
					});

					doc.setFontSize(12);
					doc.setFont('helvetica', 'bold');
					doc.text('RESTAURANT', 20, 110);

					// Bill details
					doc.setFont('helvetica', 'normal');
					doc.text(`Bill : ${billNo}`, 20, 140);
					doc.text(`Time : ${time}`, 250, 140);
					doc.text(`Date : ${dateStr}`, 20, 165);
					doc.text(`Table : ${tableNo}`, 250, 165);

					// Dashed line
					doc.line(20, 180, 330, 180);

					// Table headers with exact column alignment
					doc.setFont('helvetica', 'bold');
					doc.text('Item Name', col1X, 200);
					doc.text('Qty.', col2X + col2Width / 2, 200, {
						align: 'center',
					});
					doc.text('Rate', col3X + col3Width / 2, 200, {
						align: 'center',
					});
					doc.text('Amount', col4X + col4Width, 200, {
						align: 'right',
					});

					// Dashed line
					doc.line(20, 210, 330, 210);

					// Items with exact column alignment
					doc.setFont('helvetica', 'normal');
					let yPos = 230;
					formData.items.forEach((item) => {
						doc.text(item.name, col1X, yPos);
						doc.text(
							item.quantity.toString(),
							col2X + col2Width / 2,
							yPos,
							{
								align: 'center',
							}
						);
						doc.text(
							`Rs.${item.rate}`,
							col3X + col3Width / 2,
							yPos,
							{
								align: 'center',
							}
						);
						doc.text(`Rs.${item.amount}`, col4X + col4Width, yPos, {
							align: 'right',
						});
						yPos += 20;
					});

					// Dashed line
					doc.line(20, yPos, 330, yPos);
					yPos += 20;

					// Sub total
					doc.text('Sub Total', 20, yPos);
					doc.text(`Rs.${subTotal.toFixed(2)}`, 310, yPos, {
						align: 'right',
					});
					yPos += 20;

					// Dashed line
					doc.line(20, yPos, 330, yPos);
					yPos += 25;

					// Gross amount
					doc.setFont('helvetica', 'bold');
					doc.setFontSize(14);
					doc.text('Gross Amount', 20, yPos);
					doc.text(`Rs.${grossAmount.toFixed(2)}`, 310, yPos, {
						align: 'right',
					});
					yPos += 20;

					// Dashed line
					doc.line(20, yPos, 330, yPos);
					yPos += 30;

					// Footer
					doc.setFont('helvetica', 'normal');
					doc.setFontSize(10);
					doc.text('THANKS FOR YOUR KIND VISIT', 175, yPos, {
						align: 'center',
					});

					// Save PDF
					doc.save(
						`Bill_${dateStr.replace(/\//g, '-')}_${billNo}.pdf`
					);

					count++;
					setGeneratedCount(count);

					// Small delay to prevent browser freezing
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}
		} catch (error) {
			console.error('Error generating bills:', error);
			alert('Error generating bills. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
			{/* Control Panel */}
			<div className="bg-white rounded-2xl shadow-xl p-8">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-3 bg-blue-100 rounded-full">
						<Receipt className="h-6 w-6 text-blue-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-800">
						Bill Generator
					</h2>
				</div>

				<div className="space-y-4 mb-8">
					<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
						<Calendar className="h-5 w-5 text-gray-600" />
						<div>
							<p className="font-medium text-gray-800">
								Date Range
							</p>
							<p className="text-sm text-gray-600">
								{formData.startDate} to {formData.endDate}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
						<Building2 className="h-5 w-5 text-gray-600" />
						<div>
							<p className="font-medium text-gray-800">
								Total Bills
							</p>
							<p className="text-sm text-gray-600">
								{formData.billsPerDay} bills ×{' '}
								{calculateDateRange()} days ={' '}
								{formData.billsPerDay * calculateDateRange()}{' '}
								total bills
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-4 mb-8">
					<button
						onClick={() => setShowForm(!showForm)}
						className="w-full py-3 px-4 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
						<Edit3 className="h-4 w-4" />
						{showForm ? 'Hide Form' : 'Edit Details'}
					</button>
				</div>

				<button
					onClick={generateBills}
					disabled={isGenerating}
					className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
						isGenerating
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
					}`}>
					{isGenerating ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
							Generating Bills... ({generatedCount}/
							{formData.billsPerDay * calculateDateRange()})
						</>
					) : (
						<>
							<Download className="h-5 w-5" />
							Download All Bills
						</>
					)}
				</button>
			</div>

			{/* Form Panel */}
			{showForm && (
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-3 bg-green-100 rounded-full">
							<Edit3 className="h-6 w-6 text-green-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800">
							Edit Bill Details
						</h2>
					</div>

					<div className="space-y-6">
						{/* Restaurant Details */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800">
								Restaurant Details
							</h3>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Restaurant Name
								</label>
								<input
									type="text"
									value={formData.restaurantName}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											restaurantName: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Address
								</label>
								<input
									type="text"
									value={formData.address}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											address: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Phone Number
								</label>
								<input
									type="text"
									value={formData.phone}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											phone: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>

						{/* Date Range */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800">
								Date Range
							</h3>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Start Date
									</label>
									<input
										type="date"
										value={formData.startDate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												startDate: e.target.value,
											}))
										}
										className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										End Date
									</label>
									<input
										type="date"
										value={formData.endDate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												endDate: e.target.value,
											}))
										}
										className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>

						{/* Bill Settings */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800">
								Bill Settings
							</h3>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Bills per Day
								</label>
								<input
									type="number"
									min="1"
									max="10"
									value={formData.billsPerDay}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											billsPerDay: parseInt(
												e.target.value
											),
										}))
									}
									className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Time Start (Hour)
									</label>
									<input
										type="number"
										min="0"
										max="23"
										value={formData.timeStart}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												timeStart: parseInt(
													e.target.value
												),
											}))
										}
										className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Time End (Hour)
									</label>
									<input
										type="number"
										min="0"
										max="23"
										value={formData.timeEnd}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												timeEnd: parseInt(
													e.target.value
												),
											}))
										}
										className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>

						{/* Items */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-gray-800">
									Menu Items
								</h3>
								<button
									onClick={addItem}
									className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
									<Plus className="h-4 w-4" />
									Add Item
								</button>
							</div>

							<div className="space-y-3">
								{formData.items.map((item, index) => (
									<div
										key={index}
										className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
										<div className="col-span-5">
											<input
												type="text"
												placeholder="Item name"
												value={item.name}
												onChange={(e) =>
													updateItem(
														index,
														'name',
														e.target.value
													)
												}
												className="w-full px-2 py-1 border text-gray-900 border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
											/>
										</div>
										<div className="col-span-2">
											<input
												type="number"
												placeholder="Qty"
												value={item.quantity}
												onChange={(e) =>
													updateItem(
														index,
														'quantity',
														parseInt(
															e.target.value
														) || 0
													)
												}
												className="w-full px-2 py-1 border text-gray-900 border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
											/>
										</div>
										<div className="col-span-4">
											<input
												type="number"
												placeholder="Rate"
												value={item.rate}
												onChange={(e) =>
													updateItem(
														index,
														'rate',
														parseFloat(
															e.target.value
														) || 0
													)
												}
												className="w-full px-2 py-1 border text-gray-900 border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
											/>
										</div>
										{/* <div className="col-span-2">
											<input
												type="number"
												value={item.amount}
												disabled
												className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
											/>
										</div> */}
										<div className="col-span-1">
											{formData.items.length > 1 && (
												<button
													onClick={() =>
														removeItem(index)
													}
													className="p-1 text-red-500 hover:bg-red-100 rounded">
													<Trash2 className="h-4 w-4" />
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Bill Preview */}
			<div className="bg-white rounded-2xl shadow-xl p-8 xl:col-span-2">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-3 bg-green-100 rounded-full">
						<Receipt className="h-6 w-6 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-800">
						Bill Preview
					</h2>
				</div>

				<div className="bg-gray-50 rounded-xl p-6">
					<div className="bg-white p-6 rounded-lg shadow-sm font-mono text-sm border text-black">
						<div className="text-center mb-4">
							<div className="font-bold text-lg text-black">
								{formData.restaurantName}
							</div>
							<div className="text-black">{formData.address}</div>
							<div className="text-black">
								PH:{formData.phone}
							</div>
						</div>

						<div className="mb-4">
							<div className="font-semibold mb-2 text-black">
								RESTAURANT
							</div>
							<div className="flex justify-between mb-1">
								<span className="text-black">Bill : 1011</span>
								<span className="text-black">
									Time : {previewTime}
								</span>
							</div>
							<div className="flex justify-between mb-1">
								<span className="text-black">
									Date :{' '}
									{new Date(
										formData.startDate
									).toLocaleDateString('en-GB')}
								</span>
								<span className="text-black">Table : 86</span>
							</div>
						</div>

						<div className="border-t border-dashed border-gray-400 my-3"></div>

						<div className="mb-3">
							<div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 font-semibold mb-1">
								<span className="text-black">Item Name</span>
								<span className="text-black text-center">
									Qty.
								</span>
								<span className="text-black text-center">
									Rate
								</span>
								<span className="text-black text-right">
									Amount
								</span>
							</div>
							{formData.items.map((item, index) => (
								<div
									key={index}
									className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2">
									<span className="text-black">
										{item.name}
									</span>
									<span className="text-black text-center">
										{item.quantity}
									</span>
									<span className="text-black text-center">
										Rs.{item.rate}
									</span>
									<span className="text-black text-right">
										Rs.{item.amount}
									</span>
								</div>
							))}
						</div>

						<div className="border-t border-dashed border-gray-400 my-3"></div>

						<div className="flex justify-between mb-2">
							<span className="text-black">Sub Total</span>
							<span className="text-black">
								Rs.{calculateTotals().subTotal.toFixed(2)}
							</span>
						</div>

						<div className="border-t border-dashed border-gray-400 my-3"></div>

						<div className="flex justify-between font-bold text-lg mb-3">
							<span className="text-black">Gross Amount</span>
							<span className="text-black">
								Rs.{calculateTotals().grossAmount.toFixed(2)}
							</span>
						</div>

						<div className="border-t border-dashed border-gray-400 my-3"></div>

						<div className="text-center text-xs">
							<div className="text-black">
								THANKS FOR YOUR KIND VISIT
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
