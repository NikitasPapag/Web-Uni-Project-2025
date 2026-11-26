%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void yyerror(char *);
extern FILE *yyin;
extern FILE *yyout;
extern int yylineno;
int line = 0;
%}

%union {
    int intval;
    double dblval;
    char charval;
    char *strval;
    char *id;
}

%token <intval> INT_VAL
%token <dblval> DOUBLE_VAL
%token <charval> CHAR_VAL
%token <strval> STRING_VAL
%token <id> IDENTIFIER

%token CLASS INT CHAR DOUBLE BOOLEAN STRING VOID PUBLIC PRIVATE IF ELSE WHILE DO FOR SWITCH CASE DEFAULT BREAK TRUE FALSE RETURN NEW OUT_PRINT

%token LBRACE RBRACE LPAREN RPAREN SEMICOLON DOT COMMA ASSIGN PLUS MINUS MULT DIV GT LT EQ NEQ AND OR

%token EXCLAMATION HASH DOLLAR PERCENT AMPERSAND ASTERISK SLASH COLON QUESTION AT LBRACK BACKSLASH RBRACK CARET UNDERSCORE GRAVE PIPE TILDE

%%
program:
    class_list
    ;

class_list:
    new_class
    | new_class class_list
    ;

new_class:
    modifier CLASS class_name LBRACE opt_variable opt_method new_class RBRACE
  |
  ;

class_name:
    capital_letter identifier_characters
    ;

opt_variable:
    variable
    |
    ;

variable:
    data_type identifier SEMICOLON
    | modifier data_type identifier SEMICOLON
    ;

identifier:
    letter identifier_characters
    | underscore identifier_characters
    ;

identifier_characters:
    identifier_character
  | identifier_character identifier_characters
  |
  ;

identifier_character:
    letter
    | digit
    | underscore
    ;

modifier:
    PUBLIC
    | PRIVATE
    ;

data_type:
    INT
    | CHAR
    | DOUBLE
    | BOOLEAN
    | STRING
    ;

capital_letter:
    'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'
    ;

letter:
    'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
    | capital_letter
    ;

digit:
    '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    ;

underscore:
    '_'
    ;

special_character:
    ' '
    | '!'
    | '#'
    | '$'
    | '%'
    | '&'
    | '('
    | ')'
    | '*'
    | '+'
    | ','
    | '-'
    | '.'
    | '/'
    | ':'
    | ';'
    | '<'
    | '='
    | '>'
    | '?'
    | '@'
    | '['
    | '\\'
    | ']'
    | '^'
    | '_'
    | '`'
    | '{'
    | '|'
    | '}'
    | '~'
    ;

reserved:
    data_type
    | modifier
    | CLASS
    | NEW
    | RETURN
    | VOID
    | IF
    | ELSE
    | WHILE
    | DO
    | FOR
    | SWITCH
    | CASE
    | DEFAULT
    | BREAK
    | TRUE
    | FALSE
    ;

method:
    modifier return_type method_name LPAREN parameter_list RPAREN LBRACE opt_variable statements RBRACE
    ;

opt_method:
    method
    |
    ;

return_type:
    data_type
    | VOID
    ;

method_name:
    identifier
    ;

parameter_list:
    | parameter
    | parameter COMMA parameter_list
    |
    ;

parameter:
    data_type identifier
    ;

statements:
    statement
    | statement statements
    ;

statement:
    assign
    | loop_statement
    | control_statement
    | print_statement
    | return_statement
    | break_statement
    | comment
    ;

assign:
    identifier ASSIGN expression SEMICOLON
    ;

expression:
    literal
    | identifier
    | object_name
    | arithmetic_expression
    ;

literal:
    INT_VAL
    | CHAR_VAL
    | DOUBLE_VAL
    | TRUE
    | FALSE
    | STRING_VAL
    ;

arithmetic_expression:
    expression arithmetic_operator expression
    ;

arithmetic_operator:
    PLUS
    | MINUS
    | MULT
    | DIV
    ;

int_value:
    digit
    | digit int_value
    ;

char_value:
    "'" letter "'"
    ;

double_value:
    digit double_digits
    ;

double_digits:
    DOT digit
    | digit double_digits
    ;

boolean_value:
    TRUE
    | FALSE
    ;

string_value:
    '"' string_characters '"'
    ;

string_characters:
    string_character
    | string_character string_characters
    ;

string_character:
    letter
    | digit
    | special_character
    ;

class_object_creation:
    class_name object_name ASSIGN NEW class_name LPAREN RPAREN
    ;

member_access:
    class_object_creation '.' class_member_name SEMICOLON
    ;

object_name:
    identifier
    ;

class_member_name:
    identifier
    ;

loop_statement:
    do_while_loop
    | for_loop
    ;

do_while_loop:
    DO LBRACE statements RBRACE WHILE LPAREN condition RPAREN SEMICOLON
    ;

for_loop:
    FOR LPAREN expression SEMICOLON condition SEMICOLON expression RPAREN LBRACE statements RBRACE
    ;

condition:
    expression comparison_operator expression
    | expression logical_operator expression
    ;

comparison_operator:
    GT
    | LT
    | EQ
    | NEQ
    ;

logical_operator:
    AND
    | OR
    ;

control_statement:
    if_statement
    | switch_statement
    ;

if_statement:
    IF LPAREN condition RPAREN LBRACE statements RBRACE opt_else_if_statements opt_else_statement
    ;

opt_else_if_statements:
    else_if_statement
    |
    ;

else_if_statement:
    ELSE IF LPAREN condition RPAREN LBRACE statements RBRACE opt_else_if_statements
    ;

opt_else_statement:
    ELSE LBRACE statements RBRACE
    |
    ;

switch_statement:
    SWITCH LPAREN expression RPAREN LBRACE case_statements opt_default RBRACE
    ;

case_statements:
    case_statement
    | case_statement case_statements
    ;

case_statement:
    CASE expression ':' statements
    ;

opt_default:
    DEFAULT ':' statements
    |
    ;

print_statement:
    OUT_PRINT LPAREN STRING_VAL RPAREN SEMICOLON
    ;

return_statement:
    RETURN expression SEMICOLON
    ;

break_statement:
    BREAK SEMICOLON
    ;

comment:
    single_line_comment
    | multi_line_comment
    ;

single_line_comment:
    "//" comment_characters
    ;

multi_line_comment:
    "/*" multi_line_comment_characters "*/"
    ;

comment_characters:
    comment_character
    | comment_character comment_characters
    ;

comment_character:
    letter
    | digit
    | special_character
    | ' '
    ;

multi_line_comment_characters:
    comment_characters
    | '\n'
    ;

method_call:
    identifier DOT method_name LPAREN arguments RPAREN
    ;

arguments:
    expression
    | expression COMMA arguments
    |
    ;

%%

void yyerror(const char *s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main(int argc, char **argv) {
    ++argv, --argc;
    if (argc > 0)
        yyin = fopen(argv[0], "r");
    else
        yyin = stdin;

    return yyparse();
}
