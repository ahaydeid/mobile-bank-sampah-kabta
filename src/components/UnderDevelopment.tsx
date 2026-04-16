
export default function UnderDevelopment() {
    return (
        <div className="flex px-4 items-center bg-white justify-center min-h-[80vh]">
            <div className="text-center">
                <img
                    src="/underdev.gif"
                    alt="Under development"
                    className="mx-auto object-contain w-80"
                />

                <h1 className="text-lg font-semibold mt-4 text-gray-600 tracking-tight">
                    Fitur Dalam Pengembangan
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                    Silakan kembali lagi nanti 😃
                </p>
            </div>
        </div>
    );
}
