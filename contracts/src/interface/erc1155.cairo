use starknet::ContractAddress;
    
const IERC1155_ID: felt252 = 0x6114a8f75559e1b39fcba08ce02961a1aa082d9256a158dd3e64964e4b1b52;
const IERC1155_METADATA_URI_ID: felt252 =
    0xcabe2400d5fe509e1735ba9bad205ba5f3ca6e062da406f72f113feb889ef7;
const IERC1155_RECEIVER_ID: felt252 =


#[starknet::interface]
trait IERC1155<TState> {
    // IERC1155
    fn balance_of(account: ContractAddress, token_id: u256) -> u256;
    fn balance_of_batch(
        accounts: Span<ContractAddress>, token_ids: Span<u256>
    ) -> Span<u256>;
    fn safe_transfer_from(
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
        value: u256,
        data: Span<felt252>
    );
    fn safe_batch_transfer_from(
        from: ContractAddress,
        to: ContractAddress,
        token_ids: Span<u256>,
        values: Span<u256>,
        data: Span<felt252>
    );
    fn is_approved_for_all(
        owner: ContractAddress, operator: ContractAddress
    ) -> bool;
    fn set_approval_for_all(operator: ContractAddress, approved: bool);

    // IERC1155MetadataURI
    fn uri(token_id: u256) -> ByteArray;

    // ISRC5
    fn supports_interface(interface_id: felt252) -> bool;

    // IERC1155Camel
    fn balanceOf(account: ContractAddress, tokenId: u256) -> u256;
    fn balanceOfBatch(
        accounts: Span<ContractAddress>, tokenIds: Span<u256>
    ) -> Span<u256>;
    fn safeTransferFrom(
        from: ContractAddress,
        to: ContractAddress,
        tokenId: u256,
        value: u256,
        data: Span<felt252>
    );
    fn safeBatchTransferFrom(
        from: ContractAddress,
        to: ContractAddress,
        tokenIds: Span<u256>,
        values: Span<u256>,
        data: Span<felt252>
    );
    fn isApprovedForAll(owner: ContractAddress, operator: ContractAddress) -> bool;
    fn setApprovalForAll(operator: ContractAddress, approved: bool);
}