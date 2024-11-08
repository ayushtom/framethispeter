use core::serde::Serde;
use core::array::ArrayTrait;
use core::result::ResultTrait;
use core::option::OptionTrait;
use starknet::{class_hash::Felt252TryIntoClassHash, ContractAddress, SyscallResultTrait};
use core::traits::TryInto;
use starknet::testing::set_contract_address;
use twitter_nft_contract::tests::account_mock::SnakeAccountMock;
use twitter_nft_contract::main::TwitterNft;
use openzeppelin::token::erc1155::interface::{

        IERC1155Dispatcher, IERC1155DispatcherTrait, IERC1155MetadataURIDispatcher,
        IERC1155MetadataURIDispatcherTrait

};
use twitter_nft_contract::interface::{
    twitter_nft::{
        ITwitterNft, ITwitterNftDispatcher, ITwitterNftDispatcherTrait
    }
};

fn deploy(contract_class_hash: felt252, calldata: Array<felt252>) -> ContractAddress {
    let (address, _) = starknet::deploy_syscall(
        contract_class_hash.try_into().unwrap(), 0, calldata.span(), false
    )
        .unwrap_syscall();
    address
}

fn deploy_contracts() -> (
    ITwitterNftDispatcher, IERC1155Dispatcher, ContractAddress, ContractAddress
) {
    let owner = setup_account('PUBKEY');
    let user = setup_account('PUBKEY_USER');
    set_contract_address(owner);
    let uri: ByteArray = "https://twitter.com/";
    let mut calldata = array![];

    uri.serialize(ref calldata);
    owner.serialize(ref calldata);



    let address = deploy(
        TwitterNft::TEST_CLASS_HASH,
        calldata
    );

    (
        ITwitterNftDispatcher { contract_address: address },
        IERC1155Dispatcher { contract_address: address },
        owner,
        user,
    )
}


fn setup_account(pub_key: felt252) -> ContractAddress {
    let mut calldata = array![pub_key];
    deploy(SnakeAccountMock::TEST_CLASS_HASH, calldata)
}