import "./PartitionList.css"

export default function PartitionList({partitionList}) {
    var partitions = [];
    if (partitionList){
        var indices = partitionList.split(',');
        partitions = indices.map(index => `large${index}`);
        console.log( indices)
    }
    return (
        <div>
            <p>Partitions available:</p>
            <ul>
                {partitions.map((partition, i) => {return (<li key={i}>{partition}</li>)})}
            </ul>
        </div>
    )
}