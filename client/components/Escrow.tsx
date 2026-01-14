import { PublicKey } from "@solana/web3.js";
import { FC } from "react";

interface EscrowProps {
    publicKey?: PublicKey | null;
}
export const Escrow: FC<EscrowProps> = ({ publicKey }) => {
    return (
        <div className="">
            {/* <p className="font-semibold">Connected!</p>
            <p className="text-gray-600">
                Wallet: {publicKey!.toBase58().slice(0, 4)}...
                {publicKey!.toBase58().slice(-4)}
            </p> */}
            <button className="bg-[#512da8] hover:bg-gray-900 text-white h-10 w-25 mr-5 rounded-sm">
                Store
            </button>
            {publicKey?.toBase58() ==
            "29KKX9fQspSenNUibR9fxJCLvwGfozFPGbt486SF8JqY" ? (
                <button className="bg-[#512da8] hover:bg-gray-900 text-white h-10 w-25 rounded-sm">
                    Admin
                </button>
            ) : null}

            {publicKey?.toBase58() ==
            "29KKX9fQspSenNUibR9fxJCLvwGfozFPGbt486SF8JqY" ? (
                <div className="flex">
                    <div className="h-80 w-100 bg-[#9172da] mt-4 mr-5 rounded-sm text-white">
                        <div className="flex">
                            <div className="bg-[url(/token-image.jpg)] bg-cover bg-center h-45 w-55 m-5 rounded-lg"></div>
                            <div className="h-45 w-55 bg-[#512da8] mt-5 mr-5 mb-5 rounded-lg flex flex-col items-center justify-center">
                                <p className="text-[22px]">SED TOKEN</p>
                                <div className="text-start">
                                    <p>Token Price: </p>
                                    <p>Token Supply: </p>
                                    <p>Token Left: </p>
                                </div>
                            </div>
                        </div>
                        <input className="bg-[#512da8] h-20 w-65 mr-5 rounded-lg"></input>
                        <button className="bg-[#512da8] hover:bg-gray-900 h-20 w-20 rounded-lg">
                            BUY
                        </button>
                    </div>
                    <div className="h-80 w-100 bg-[#9172da] mt-4 rounded-sm text-white">
                        <div className="flex">
                            <div className="bg-[url(/token-image.jpg)] bg-cover bg-center h-45 w-55 m-5 rounded-lg"></div>
                            <div className="h-45 w-55 bg-[#512da8] mt-5 mr-5 mb-5 rounded-lg flex flex-col items-center justify-center">
                                <p className="text-[22px]">SED TOKEN</p>
                                <div className="text-start">
                                    <p>Token Price: </p>
                                    <p>Token Supply: </p>
                                    <p>Token Left: </p>
                                </div>
                            </div>
                        </div>
                        <input className="bg-[#512da8] h-20 w-65 mr-5 rounded-lg"></input>
                        <button className="bg-[#512da8] hover:bg-gray-900 h-20 w-20 rounded-lg">
                            BUY
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-80 w-100 bg-[#9172da] mt-4 rounded-sm text-white">
                    <div className="flex">
                        <div className="bg-[url(/token-image.jpg)] bg-cover bg-center h-45 w-55 m-5 rounded-lg"></div>
                        <div className="h-45 w-55 bg-[#512da8] mt-5 mr-5 mb-5 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-[22px]">SED TOKEN</p>
                            <div className="text-start">
                                <p>Token Price: {} </p>
                                <p>Token Supply: {} </p>
                                <p>Token Left: {}</p>
                            </div>
                        </div>
                    </div>
                    <input className="bg-[#512da8] h-20 w-65 mr-5 rounded-lg"></input>
                    <button className="bg-[#512da8] hover:bg-gray-900 h-20 w-20 rounded-lg">
                        BUY
                    </button>
                </div>
            )}
        </div>
    );
};
