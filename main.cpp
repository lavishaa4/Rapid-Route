#include "Chatbot.h"
using namespace std;

int main() {
    Chatbot bot;
    bot.loadCSV("data/metro_filtered.csv");
    bot.buildGraph();
    bot.start();
    return 0;
}
