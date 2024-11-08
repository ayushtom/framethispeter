import { Tweet, components } from "../components/tweet";

type TweetIdProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: TweetIdProps) {
  const res = await fetch(
    `${process.env.API_URL}/checkLimitedEdition?id=${params.id}`,
    { cache: "no-store" }
  );

  const formattedRes = await res.json();

  const getRandomBackground = () => {
    console.log(
      `${process.env.API_URL}/checkLimitedEdition?id=${params.id}`,
      formattedRes
    );
    if (formattedRes === true) {
      return "url(/goldbg.jpg)";
    }
    const randomBackgroundColors = [
      "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
      "linear-gradient(45deg, #FBDA61 0%, #FF5ACD 100%)",
      "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
      "linear-gradient(to right, #b6fbff, #83a4d4)",
      "linear-gradient(to right, #ff9966, #ff5e62)",
      "linear-gradient(to right, #2c3e50, #4ca1af)",
    ];

    const randomColor =
      randomBackgroundColors[
        Math.floor(Math.random() * randomBackgroundColors.length)
      ];

    return randomColor;
  };
  return (
    <main className="min-h-screen flex-col w-100 flex justify-center items-center p-24">
      <div
        style={{
          display: "flex",
          padding: "48px",
          aspectRatio: 1,
          boxSizing: "border-box",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: getRandomBackground(),
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
        id="twitter-screenshot-instance"
      >
        <div
          data-theme="dark"
          style={{ display: "flex", width: 500, justifyContent: "center" }}
        >
          <Tweet id={params.id} components={components} />
        </div>
      </div>
    </main>
  );
}
