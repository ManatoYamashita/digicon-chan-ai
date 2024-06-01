import Greets from './greets';

type Props = {
    greets: string[];
    msg1: string;
    msg2: string;
}

export default function Hello({ greets, msg1, msg2 }: Props) {
    return (
        <section>
            <Greets greets={ greets } />
            <Greets greets={msg1} />
            <Greets greets={msg2} />
        </section>
    );
}