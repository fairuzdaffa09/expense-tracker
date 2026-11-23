import Image from "next/image";

export const SummaryCard = ({ title, icon, alt, value }) => {
  return (
    <div className="flex w-full flex-col rounded-2xl bg-linear-to-br from-zinc-900 to-green-900 p-7 md:flex-1">
      <div className="flex flex-row gap-1 justify-between items-center">
        <Image src={icon} alt={alt} width={50} height={20} />
        <div className="flex flex-col justify-center">
          <h2 className="text-white/80 text-xl">{title}</h2>
          <h1 className="text-white text-2xl font-bold">{value}</h1>
        </div>
      </div>
    </div>
  );
};
