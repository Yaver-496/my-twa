import { useEffect, useState } from 'react';
import Counter from '../dapp/Counter';
import useTonClient from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import useTonConnect from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';

export default function useCounterContract() {

    const client = useTonClient();
    const [val, setVal] = useState<null | string>();
    const { sender } = useTonConnect();

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const counterContract = useAsyncInitialize( async () =>{
        if(!client) return;

        const contract = new Counter(
            Address.parse('EQC4ygFIiSfmHC7MmpBBqrR8JATLJ9_KjiQ6Q_sKJmccXOZl')
        );

        return client.open(contract) as OpenedContract<Counter>;
    }, 
    [client]);
    
    useEffect(() => 
    {
        async function getValue() 
        {
            if(!counterContract) return;    
            setVal(null);
            const val = await counterContract.getCounter(); 
            setVal(val.toString());
            await sleep(25000);
            getValue();
        }

        getValue();

    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrement(sender);
        },
    };
}
