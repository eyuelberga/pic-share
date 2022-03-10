import "./PartitionList.css"

export default function PartitionList({ partitionList, usersList }) {
    var partitions = [];
    if (partitionList) {
        console.log('partitionsList: ', partitionList);
        var indices = partitionList.split(',');
        partitions = indices.map(index => `large${index}`);
        console.log(indices)
    }
    console.log('usersList: ', usersList);
    return (
        <div>
            <p>Partitions available on this node:</p>
            <ul>
                {partitions.map((partition, i) => (<li key={i}>{partition}</li>))}
            </ul>
            <p>Partitions available on all nodes:</p>
            <ul>
                {usersList.map((u, i) => {
                    if (u.partitions) {
                        return (<li key={i}>{u.username}: {u.partitions.toString()}</li>);
                    } else {
                        return null;
                    }
                })}
            </ul>
        </div>
    )
}