"use client";
import { SummaryCard } from "./components/SummaryCard";
import { useState } from "react";
import z from "zod";

const formatRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const initialTransactions = [
  {
    id: 1,
    date: "2026-10-15",
    description: "Coffee",
    category: "Food & Drinks",
    amount: 35000,
    type: "expense",
  },
  {
    id: 2,
    date: "2026-10-14",
    description: "Grocery shopping",
    category: "Shopping",
    amount: 245000,
    type: "expense",
  },
  {
    id: 3,
    date: "2026-10-13",
    description: "Monthly salary",
    category: "Income",
    amount: 5000000,
    type: "income",
  },
];

export default function Home() {
  const [sort, setSort] = useState({
    column: "date",
    direction: "desc",
  });
  const [transactions, setTransactions] = useState(initialTransactions);
  const [errors, setErrors] = useState({});
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransaction =
    typeFilter === "all"
      ? transactions
      : transactions.filter((trx) => {
          return trx.type === typeFilter;
        });

  const sortedTransaction =
    sort.column === "amount"
      ? sort.direction === "asc"
        ? [...filteredTransaction].sort(
            (a, b) => a[sort.column] - b[sort.column],
          )
        : [...filteredTransaction].sort(
            (a, b) => b[sort.column] - a[sort.column],
          )
      : sort.direction === "asc"
        ? [...filteredTransaction].sort((a, b) =>
            a[sort.column].localeCompare(b[sort.column]),
          )
        : [...filteredTransaction].sort((a, b) =>
            b[sort.column].localeCompare(a[sort.column]),
          );

  let totalIncome = 0;
  let totalExpenses = 0;
  let trxCount = transactions.length;

  transactions.forEach((trx) => {
    if (trx.type === "expense") {
      totalExpenses = totalExpenses + trx.amount;
    } else {
      totalIncome = totalIncome + trx.amount;
    }
  });

  const balance = totalIncome - totalExpenses;

  const summaryCards = [
    {
      title: "Total Balance",
      value: formatRupiah.format(balance),
      icon: "/icons/wallet.svg",
      alt: "Wallet",
    },
    {
      title: "October Total Income",
      value: formatRupiah.format(totalIncome),
      icon: "/icons/arrow-up.svg",
      alt: "Income",
    },
    {
      title: "October Total Expense",
      value: formatRupiah.format(totalExpenses),
      icon: "/icons/arrow-down.svg",
      alt: "Expense",
    },
    {
      title: "October Transaction",
      value: trxCount,
      icon: "/icons/chart-bars.svg",
      alt: "Transaction history",
    },
  ];

  const newTransactionSchema = z.object({
    descriptionNew: z.string().trim().min(1, "Description is Required"),
    amountNew: z.number().min(1, "Amount is Required"),
    typeNew: z.string().min(1, "Please Select Transaction Type"),
    dateNew: z.iso.date(),
    categoryNew: z.string().min(1, "Please Select Transaction Category"),
  });

  function handleSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    // console.log(formData);

    const input = {
      descriptionNew: formData.get("description"),
      amountNew: Number(formData.get("amount")),
      typeNew: formData.get("type"),
      dateNew: formData.get("date"),
      categoryNew: formData.get("category"),
    };

    const sanitizedInput = newTransactionSchema.safeParse(input);

    if (!sanitizedInput.success) {
      const fieldErrors = {};
      for (const issue of sanitizedInput.error.issues) {
        const field = issue.path[0];
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      console.log(errors);

      return;
    }

    console.log("Valid registration:", sanitizedInput.data);

    let newTransaction = {
      id: crypto.randomUUID(),
      date: sanitizedInput.data.dateNew,
      description: sanitizedInput.data.descriptionNew,
      category: sanitizedInput.data.categoryNew,
      amount: sanitizedInput.data.amountNew,
      type: sanitizedInput.data.typeNew,
    };

    console.log(newTransaction);

    setTransactions((previousTransactions) => [
      ...previousTransactions,
      newTransaction,
    ]);
    setErrors({});
    for (const name of ["date", "description", "amount", "category", "type"]) {
      form.elements.namedItem(name).value = "";
    }
  }

  function handleSort(column) {
    console.log(column);

    if (column === sort.column) {
      if (sort.direction === "asc") {
        setSort({
          column: sort.column,
          direction: "desc",
        });
      } else {
        setSort({
          column: sort.column,
          direction: "asc",
        });
      }
    } else {
      setSort({
        column: column,
        direction: "asc",
      });
    }
  }

  function handleDelete(id) {
    setTransactions((previousTransactions) => {
      return previousTransactions.filter((trx) => {
        return trx.id !== id;
      });
    });
  }

  function filterTable(e) {
    setTypeFilter(e.target.value);
    console.log(e.target.value);
  }

  return (
    <main className="min-h-screen bg-[#0d1719] text-white p-10">
      <header className="pb-6">
        <h1 className="text-2xl font-semibold">Good Morning!</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Here's your Financial Overview for October 2026
        </p>
      </header>
      <div className="flex flex-col flex-1 items-center pb-20 font-sans">
        <div className="flex w-full flex-col gap-4 md:flex-row">
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              icon={card.icon}
              alt={card.alt}
              value={card.value}
            />
          ))}
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="transactions-heading"
          className="min-w-0 overflow-hidden rounded-2xl border border-emerald-300/10 bg-[#101e20]"
        >
          <div className="flex flex-col gap-4 px-6 pt-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="transactions-heading"
              className="text-lg font-semibold tracking-tight text-white"
            >
              Recent Transactions
            </h2>
            <div className="flex items-center gap-3">
              <label htmlFor="type-filter" className="text-sm text-zinc-400">
                Show
              </label>
              <select
                onChange={filterTable}
                id="type-filter"
                name="type-filter"
                value={typeFilter}
                className="min-w-32 rounded-lg border border-emerald-300/10 bg-[#1c292b] px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-emerald-300/30 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-y border-emerald-300/10 bg-emerald-400/5 text-zinc-400">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 font-medium cursor-pointer"
                  >
                    <button onClick={() => handleSort("date")}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Date
                        {sort.column === "date" && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path
                              d={
                                sort.direction === "asc"
                                  ? "M12 20V4m-7 7 7-7 7 7"
                                  : "M12 4v16m-7-7 7 7 7-7"
                              }
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 font-medium cursor-pointer"
                  >
                    <button onClick={() => handleSort("type")}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Transaction Type{" "}
                        {sort.column === "type" && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path
                              d={
                                sort.direction === "asc"
                                  ? "M12 20V4m-7 7 7-7 7 7"
                                  : "M12 4v16m-7-7 7 7 7-7"
                              }
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 font-medium cursor-pointer"
                  >
                    <button onClick={() => handleSort("description")}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Description
                        {sort.column === "description" && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path
                              d={
                                sort.direction === "asc"
                                  ? "M12 20V4m-7 7 7-7 7 7"
                                  : "M12 4v16m-7-7 7 7 7-7"
                              }
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 font-medium cursor-pointer"
                  >
                    <button onClick={() => handleSort("category")}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Category
                        {sort.column === "category" && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path
                              d={
                                sort.direction === "asc"
                                  ? "M12 20V4m-7 7 7-7 7 7"
                                  : "M12 4v16m-7-7 7 7 7-7"
                              }
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right font-medium cursor-pointer"
                  >
                    <button onClick={() => handleSort("amount")}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Amount{" "}
                        {sort.column === "amount" && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path
                              d={
                                sort.direction === "asc"
                                  ? "M12 20V4m-7 7 7-7 7 7"
                                  : "M12 4v16m-7-7 7 7 7-7"
                              }
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedTransaction.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="w-full px-6 py-10">
                      <p className="text-sm text-center">
                        No Transactions Yet!
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedTransaction.map((trx) => (
                    <tr
                      key={trx.id}
                      className="transition-colors hover:bg-emerald-400/5"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                        {formatDate.format(new Date(`${trx.date}T00:00:00`))}
                      </td>
                      <td
                        className={`whitespace-nowrap px-6 py-4 font-bold ${
                          trx.type === "expense"
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {trx.type === "income" ? "Income" : "Expense"}
                      </td>
                      <td className="px-6 py-4 text-zinc-100">
                        {trx.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                        {trx.category}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium tabular-nums ${
                          trx.type === "expense"
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {trx.type === "expense"
                          ? `- ${formatRupiah.format(trx.amount)}`
                          : `+ ${formatRupiah.format(trx.amount)}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            aria-label="Delete transaction"
                            onClick={() => handleDelete(trx.id)}
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 456 511.82"
                              xmlns="http://www.w3.org/2000/svg"
                              shapeRendering="geometricPrecision"
                              textRendering="geometricPrecision"
                              imageRendering="optimizeQuality"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            >
                              <path
                                fill="#FD3B3B"
                                d="M48.42 140.13h361.99c17.36 0 29.82 9.78 28.08 28.17l-30.73 317.1c-1.23 13.36-8.99 26.42-25.3 26.42H76.34c-13.63-.73-23.74-9.75-25.09-24.14L20.79 168.99c-1.74-18.38 9.75-28.86 27.63-28.86zM24.49 38.15h136.47V28.1c0-15.94 10.2-28.1 27.02-28.1h81.28c17.3 0 27.65 11.77 27.65 28.01v10.14h138.66c.57 0 1.11.07 1.68.13 10.23.93 18.15 9.02 18.69 19.22.03.79.06 1.39.06 2.17v42.76c0 5.99-4.73 10.89-10.62 11.19-.54 0-1.09.03-1.63.03H11.22c-5.92 0-10.77-4.6-11.19-10.38 0-.72-.03-1.47-.03-2.23v-39.5c0-10.93 4.21-20.71 16.82-23.02 2.53-.45 5.09-.37 7.67-.37zm83.78 208.38c-.51-10.17 8.21-18.83 19.53-19.31 11.31-.49 20.94 7.4 21.45 17.57l8.7 160.62c.51 10.18-8.22 18.84-19.53 19.32-11.32.48-20.94-7.4-21.46-17.57l-8.69-160.63zm201.7-1.74c.51-10.17 10.14-18.06 21.45-17.57 11.32.48 20.04 9.14 19.53 19.31l-8.66 160.63c-.52 10.17-10.14 18.05-21.46 17.57-11.31-.48-20.04-9.14-19.53-19.32l8.67-160.62zm-102.94.87c0-10.23 9.23-18.53 20.58-18.53 11.34 0 20.58 8.3 20.58 18.53v160.63c0 10.23-9.24 18.53-20.58 18.53-11.35 0-20.58-8.3-20.58-18.53V245.66z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        <form
          onSubmit={handleSubmit}
          aria-labelledby="add-transaction-heading"
          className="min-w-0 space-y-6 rounded-2xl border border-emerald-300/10 bg-[#101e20] p-6"
        >
          <div>
            <h2
              id="add-transaction-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Add Transaction
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Keep track of money in and out.
            </p>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-zinc-300"
              >
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white scheme-dark focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              {errors.dateNew && (
                <p className="text-red-500 text-sm m-1">
                  {errors.dateNew}
                  <span>
                    <strong> !</strong>
                  </span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-300"
              >
                Description
              </label>
              <input
                id="description"
                name="description"
                placeholder="e.g. Coffee or monthly salary"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              {errors.descriptionNew && (
                <p className="text-red-500 text-sm m-1">
                  {errors.descriptionNew}
                  <span>
                    <strong> !</strong>
                  </span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-zinc-300"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-[#1c292b] px-4 py-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="Food & Drinks">Food &amp; Drinks</option>
                <option value="Shopping">Shopping</option>
                <option value="Transportation">Transportation</option>
                <option value="Bills & Utilities">Bills &amp; Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Income">Income</option>
                <option value="Others">Others</option>
              </select>
              {errors.categoryNew && (
                <p className="text-red-500 text-sm m-1">
                  {errors.categoryNew}
                  <span>
                    <strong> !</strong>
                  </span>
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Amount
                </label>
                <div className="flex items-center rounded-lg border border-white/10 bg-white/5 focus-within:border-emerald-400/60 focus-within:ring-2 focus-within:ring-emerald-400/20">
                  <span className="pl-4 text-sm text-zinc-400">Rp</span>
                  <input
                    id="amount"
                    type="number"
                    placeholder="0"
                    name="amount"
                    className="min-w-0 w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
                {errors.amountNew && (
                  <p className="text-red-500 text-sm m-1">
                    {errors.amountNew}
                    <span>
                      <strong> !</strong>
                    </span>
                  </p>
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="trx-type"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Type
                </label>
                <select
                  name="type"
                  id="trx-type"
                  defaultValue=""
                  className="w-full rounded-lg border border-white/10 bg-[#1c292b] px-4 py-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option disabled value="">
                    Select type
                  </option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                {errors.typeNew && (
                  <p className="text-red-500 text-sm m-1">
                    {errors.typeNew}
                    <span>
                      <strong> !</strong>
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </main>
  );
}
