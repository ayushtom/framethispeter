export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex text-center flex-col gap-8">
        <p className=" text-2xl">Hey 👋</p>
        <p>
          <b>This is the home for a twitter bot - @framethispeter. </b>
        </p>

        <div className="flex flex-col gap-2">
          <p>It is a bot which mints tweet images directly to your wallet.</p>

          <p>
            Do give it a try and share how you feel about it by tagging the bot
            on twitter! 
          </p>
          <p>
           Bot link - https://x.com/framethispeter 
          </p>
        </div>
      </div>
    </main>
  );
}
