// The shop's data and the jobs it does. Every method used by Program.cs
// has one mistake that only shows up while the program runs.

public class Shop
{
    private readonly Dictionary<string, int> stock = new() { ["apples"] = 12, ["bread"] = 4 };
    private readonly List<string> deliveries = new() { "Monday", "Thursday" };
    private readonly int[] shelfSizes = { 10, 20, 30 };

    public string? FindNickname(string name)
    {
        return name == "Ada" ? "The Countess" : null;
    }

    public int NicknameLength(string name)
    {
        string? nickname = FindNickname(name);
        return nickname.Length;
    }

    public int ReadQuantity(string typed)
    {
        return int.Parse(typed);
    }

    public int LastShelfSize()
    {
        return shelfSizes[shelfSizes.Length];
    }

    public string ThirdDelivery()
    {
        return deliveries[2];
    }

    public int HowMany(string item)
    {
        return stock[item];
    }

    public int ItemsPerShelf(int items, int shelves)
    {
        return items / shelves;
    }

    public int PriceFromLabel(object label)
    {
        return (int)label;
    }

    public string LastYearSales()
    {
        return File.ReadAllText("sales_last_year.csv");
    }

    public void RemoveSoldOut()
    {
        foreach (string day in deliveries)
        {
            if (day == "Monday")
            {
                deliveries.Remove(day);
            }
        }
    }

    public int CountDown(int days)
    {
        return 1 + CountDown(days - 1);
    }
}
