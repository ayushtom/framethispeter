use core::debug::PrintTrait;
use starknet::ContractAddress;
use starknet::testing;
use starknet::testing::{set_contract_address, set_block_timestamp};
use starknet::contract_address_const;
use core::hash::LegacyHash;
use super::utils::{deploy_contracts};
use openzeppelin::token::erc1155::interface::{
    IERC1155Dispatcher, IERC1155DispatcherTrait, IERC1155MetadataURIDispatcher,
    IERC1155MetadataURIDispatcherTrait
};
use twitter_nft_contract::interface::{
    twitter_nft::{
        ITwitterNft, ITwitterNftDispatcher, ITwitterNftDispatcherTrait
    }
};



#[test]
#[available_gas(20000000000)]
fn test_minting() {
    let (assets_contract, erc1155, owner, user) = deploy_contracts();
    let tweet_id = 1795757183726207152;
    set_contract_address(owner);

    assets_contract.enable_contract();

    // enable minting and burning functions
    assets_contract.admin_mint(tweet_id, user, tweet_id);

    // test balance of
    let balance = erc1155.balance_of(user, tweet_id);
    assert(balance == 1, 'wrong balance token_id_1');
}

#[test]
#[available_gas(20000000000)]
#[should_panic(expected: ('Asset cap reached', 'ENTRYPOINT_FAILED'))]
fn test_limited_minting() {
    let (assets_contract, erc1155, owner, user) = deploy_contracts();
    let tweet_id = 1795757183726207152;
    set_contract_address(owner);

    assets_contract.enable_contract();

    assets_contract.set_asset_cap(tweet_id, 3);

    // enable minting and burning functions
    assets_contract.admin_mint(tweet_id, user, tweet_id);

    // test balance of
    let balance = erc1155.balance_of(user, tweet_id);
    assert(balance == 1, 'wrong balance token_id_1');

    // try to mint again
    assets_contract.admin_mint(tweet_id, user, tweet_id);

    assets_contract.admin_mint(tweet_id, user, tweet_id);
    assets_contract.admin_mint(tweet_id, user, tweet_id);

}

#[test]
#[available_gas(20000000000)]
#[should_panic(expected: ('Contract is disabled', 'ENTRYPOINT_FAILED'))]
fn test_minting_contract_disabled() {
    let (assets_contract, _, _, user) = deploy_contracts();
    let tweet_id = 1795757183726207152;
    assets_contract.admin_mint(tweet_id, user, tweet_id);
}

#[test]
#[available_gas(20000000000)]
#[should_panic(expected: ('Caller is not the owner', 'ENTRYPOINT_FAILED'))]
fn test_enable_contract_not_admin() {
    let (assets_contract, _, _, user) = deploy_contracts();

    set_contract_address(user);
    assets_contract.enable_contract();
}

#[test]
#[available_gas(20000000000)]
#[should_panic(expected: ('Caller is not the owner', 'ENTRYPOINT_FAILED'))]
fn test_disable_contract_not_admin() {
    let (assets_contract, _, _, user) = deploy_contracts();
    assets_contract.enable_contract();

    set_contract_address(user);
    assets_contract.disable_contract();
}