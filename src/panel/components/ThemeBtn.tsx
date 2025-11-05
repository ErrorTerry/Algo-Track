export default function ThemeBtn() {
  return (
    <>
        <button
            className="btn"
            onClick={() => {
                document.documentElement.dataset.theme =
                    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            }}
        >
            🌙 테마 전환
        </button>
    </>
  );
}
