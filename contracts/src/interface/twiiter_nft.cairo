use starknet::ContractAddress;

#[starknet::interface]
trait ITwitterNft<TContractState> {
    // admin
    fn admin_mint(
        ref self: TContractState, token_id: u256, receiver: ContractAddress ,tweet_id: u256 
    );

    fn set_asset_cap(ref self: TContractState,token_id: u256,asset_cap: u256);

    // admin
    fn enable_contract(ref self: TContractState);
    fn disable_contract(ref self: TContractState);
    fn transferFrom(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    );
    fn transfer_from(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, token_id: u256
    );
    fn get_existing_supply(self: @TContractState, token_id: u256) -> u256;
    fn get_asset_cap(self: @TContractState, token_id: u256) -> u256;

    fn set_base_uri(ref self: TContractState, base_uri: ByteArray);

    fn supportsInterface(self: @TContractState,interface_id: felt252) -> bool;
}