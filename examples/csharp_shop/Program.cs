// C# Shop: practice C# mistakes that happen while the program runs.
//
//   dotnet run --project csharp_shop          lists the scenarios
//   dotnet run --project csharp_shop -- 2     runs scenario 2 and shows its error
//
// Select the error in the terminal, right-click, and pick
// "Errorwise: Explain this error".

var shop = new Shop();

var scenarios = new (string Title, Action Run)[]
{
    ("Show how long Linus's nickname is", () => Console.WriteLine(shop.NicknameLength("Linus"))),
    ("Read a quantity the customer typed as a word", () => Console.WriteLine(shop.ReadQuantity("three"))),
    ("Show the size of the last shelf", () => Console.WriteLine(shop.LastShelfSize())),
    ("Show the third delivery day", () => Console.WriteLine(shop.ThirdDelivery())),
    ("Check how much milk is on the shelf", () => Console.WriteLine(shop.HowMany("milk"))),
    ("Share the apples across zero shelves", () => Console.WriteLine(shop.ItemsPerShelf(12, 0))),
    ("Read a price from a label", () => Console.WriteLine(shop.PriceFromLabel("5"))),
    ("Open last year's sales file", () => Console.WriteLine(shop.LastYearSales())),
    ("Remove Monday from the delivery days", () => shop.RemoveSoldOut()),
    ("Count the days until a delivery", () => Console.WriteLine(shop.CountDown(3))),
};

if (args.Length == 0)
{
    Console.WriteLine("C# Shop practice project. Every scenario hits one mistake.\n");
    for (int i = 0; i < scenarios.Length; i++)
    {
        Console.WriteLine($"  {i + 1,2}. {scenarios[i].Title}");
    }
    Console.WriteLine("\nRun one with:  dotnet run --project csharp_shop -- 2");
    return;
}

scenarios[int.Parse(args[0]) - 1].Run();
